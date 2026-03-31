package com.campus.academyservice.service;

import com.campus.academyservice.dto.ModuleDto;
import com.campus.academyservice.dto.TopicDto;
import com.campus.academyservice.entity.Module;
import com.campus.academyservice.entity.SectionSubjectAllocation;
import com.campus.academyservice.entity.Topic;
import com.campus.academyservice.repo.ModuleRepository;
import com.campus.academyservice.repo.SectionSubjectAllocationRepository;
import com.campus.academyservice.repo.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SyllabusService {

    private final ModuleRepository moduleRepository;
    private final TopicRepository topicRepository;
    private final SectionSubjectAllocationRepository allocationRepository; // Inject the router!

    // The new "Smart" Syllabus Fetcher
    public List<ModuleDto> getSyllabusForClass(String sectionName, String timetableSlotCode) {

        // 1. Check if this slot is a generic elective (e.g., CS3204) that needs routing
        String targetSubjectCode = timetableSlotCode;

        Optional<SectionSubjectAllocation> allocation =
                allocationRepository.findBySectionNameAndTimetableSlotCode(sectionName, timetableSlotCode);

        if (allocation.isPresent()) {
            // Reroute! Change 'CS3204' to 'SN' or 'CC'
            targetSubjectCode = allocation.get().getActualSubjectCode();
        }

        // 2. Fetch the syllabus using the real subject code
        List<Module> modules = moduleRepository.findBySubjectCodeOrderByModuleNumberAsc(targetSubjectCode);

        // 3. Map to DTOs
        return modules.stream().map(module -> {
            List<Topic> topics = topicRepository.findByModuleIdOrderByTopicNumberAsc(module.getId());

            List<TopicDto> topicDtos = topics.stream().map(topic -> TopicDto.builder()
                    .id(topic.getId())
                    .topicNumber(topic.getTopicNumber())
                    .title(topic.getTitle())
                    .description(topic.getDescription())
                    .build()).collect(Collectors.toList());

            return ModuleDto.builder()
                    .id(module.getId())
                    .moduleNumber(module.getModuleNumber())
                    .title(module.getTitle())
                    .topics(topicDtos)
                    .build();
        }).collect(Collectors.toList());
    }


    public int getTotalTopicCount(String subjectCode) {
        try {
            return topicRepository.countBySubjectCode(subjectCode);
        } catch (Exception e) {
            // Failsafe: If the database throws a fit, return 0 so the dashboard doesn't crash
            return 0;
        }
    }
}