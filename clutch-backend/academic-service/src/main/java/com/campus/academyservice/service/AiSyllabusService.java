package com.campus.academyservice.service;

import com.campus.academyservice.dto.AiSyllabusPayload;
import com.campus.academyservice.entity.Module;
import com.campus.academyservice.entity.Topic;
import com.campus.academyservice.repo.ModuleRepository;
import com.campus.academyservice.repo.TopicRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import org.apache.pdfbox.Loader;

@Service
@RequiredArgsConstructor
public class AiSyllabusService {

    private final ModuleRepository moduleRepository;
    private final TopicRepository topicRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    // 🚨 1. THE AI EXTRACTION ENGINE 🚨
    public String processPdfWithAI(MultipartFile file, String subjectCode) throws Exception {

        // A. Read the PDF Text
        String pdfText = "";
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            pdfText = stripper.getText(document);
        }

        // B. THE PROMPT: Forcing the Time-Series Pacing Math
        String prompt = "You are an expert university curriculum planner. Read the following syllabus text. " +
                "Extract all Modules and their nested Topics. " +
                "CRITICAL INSTRUCTION: Assume a standard semester has exactly 45 lectures. " +
                "You must assign a sequential 'targetLectureNumber' to every single topic, starting from 1 and ending near 45. " +
                "For example, Module 1 topics might be lectures 1-8, Module 2 might be lectures 9-18. " +
                "Return ONLY a valid JSON object matching this exact structure, with NO markdown formatting: " +
                "{ \"subjectCode\": \"" + subjectCode + "\", \"totalEstimatedLectures\": 45, \"modules\": [ { \"moduleNumber\": 1, \"title\": \"Module Name\", \"topics\": [ { \"topicNumber\": 1, \"title\": \"Topic Name\", \"targetLectureNumber\": 1 } ] } ] } \n\n" +
                "SYLLABUS TEXT:\n" + pdfText;

        // C. Call Google Gemini API
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;
        String requestBody = "{\"contents\": [{\"parts\": [{\"text\": \"" + prompt.replace("\"", "\\\"").replace("\n", "\\n") + "\"}]}]}";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        String response = restTemplate.postForObject(url, entity, String.class);

        // D. Parse the JSON out of Gemini's response
        JsonNode rootNode = objectMapper.readTree(response);
        String aiText = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        // Clean up markdown blocks if Gemini includes them
        return aiText.replaceAll("```json", "").replaceAll("```", "").trim();
    }

    // 🚨 2. THE DATABASE PUBLISHER (Upsert Logic) 🚨
    @Transactional
    public void publishToDatabase(String verifiedJson) {
        try {
            AiSyllabusPayload payload = objectMapper.readValue(verifiedJson, AiSyllabusPayload.class);
            String subjectCode = payload.getSubjectCode();

            List<Module> existingModules = moduleRepository.findBySubjectCodeOrderByModuleNumberAsc(subjectCode);

            for (AiSyllabusPayload.AiModule aiMod : payload.getModules()) {

                Module moduleEntity = existingModules.stream()
                        .filter(m -> m.getModuleNumber().equals(aiMod.getModuleNumber()))
                        .findFirst()
                        .orElseGet(() -> {
                            Module newMod = new Module();
                            newMod.setSubjectCode(subjectCode);
                            newMod.setModuleNumber(aiMod.getModuleNumber());
                            return newMod;
                        });

                moduleEntity.setTitle(aiMod.getTitle());
                Module savedModule = moduleRepository.save(moduleEntity);

                List<Topic> existingTopics = topicRepository.findByModuleIdOrderByTopicNumberAsc(savedModule.getId());

                for (AiSyllabusPayload.AiTopic aiTopic : aiMod.getTopics()) {

                    String topicNumberStr = String.valueOf(aiTopic.getTopicNumber());

                    Topic topicEntity = existingTopics.stream()
                            .filter(t -> t.getTopicNumber().equals(topicNumberStr))
                            .findFirst()
                            .orElseGet(() -> {
                                Topic newTopic = new Topic();
                                newTopic.setModuleId(savedModule.getId());
                                newTopic.setTopicNumber(topicNumberStr);
                                return newTopic;
                            });

                    topicEntity.setTitle(aiTopic.getTitle());
                    topicEntity.setDescription("AI Generated target timeline");
                    topicEntity.setTargetLectureNumber(aiTopic.getTargetLectureNumber());

                    topicRepository.save(topicEntity);
                }
            }
            System.out.println("✅ AI Syllabus Published Successfully for: " + subjectCode);

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse and save AI syllabus: " + e.getMessage());
        }
    }
}