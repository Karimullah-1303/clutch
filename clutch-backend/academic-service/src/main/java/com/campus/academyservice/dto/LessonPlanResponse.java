package com.campus.academyservice.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class LessonPlanResponse {
    private UUID id;
    private String subjectCode;
    private String sectionName;
    private LocalDate classDate;
    private String notes;
    private String homework;
    private String status;
    private List<UUID> completedTopicIds; // 🚨 THIS is what React needs!
    private List<UUID> pushedTopicIds;
}