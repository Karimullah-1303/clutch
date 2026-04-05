package com.campus.academyservice.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
public class LessonPlanRequest {
    private UUID teacherId;
    private String subjectCode;
    private String sectionName;
    private LocalDate classDate;
    private LocalTime startTime;
    private String notes;
    private String homework;
    private String status;


    private List<UUID> topicIds;


    private List<UUID> completedTopicIds;
    private List<UUID> pushedTopicIds;
}