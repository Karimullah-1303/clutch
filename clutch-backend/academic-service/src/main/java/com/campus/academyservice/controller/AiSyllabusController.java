package com.campus.academyservice.controller;

import com.campus.academyservice.service.AiSyllabusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/academic/admin/syllabus")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiSyllabusController {

    private final AiSyllabusService aiSyllabusService;

    //  1. RECEIVES THE PDF AND RUNS GEMINI
    @PostMapping("/ai-extract")
    public ResponseEntity<String> extractSyllabus(
            @RequestParam("subjectCode") String subjectCode,
            @RequestParam("file") MultipartFile file) {
        try {
            String jsonResult = aiSyllabusService.processPdfWithAI(file, subjectCode);
            return ResponseEntity.ok(jsonResult);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"AI Processing Failed\"}");
        }
    }

    //  2. SAVES THE APPROVED DATA TO POSTGRES
    @PostMapping("/ai-publish")
    public ResponseEntity<String> publishSyllabus(@RequestBody String verifiedJsonPayload) {
        aiSyllabusService.publishToDatabase(verifiedJsonPayload);
        return ResponseEntity.ok("{\"message\": \"Published Successfully\"}");
    }
}