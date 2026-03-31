package com.campus.academyservice.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class SmartLessonPlanResponse {
    private List<UUID> historicallyCompletedTopicIds; // Feeds the UI Progress Wheels
    private List<TopicDto> todaysTargets;             // Feeds the "Green Zone" checklist
    private List<TopicDto> carryoverTopics;
    private int totalSyllabusTopics;                  // Helps calculate the global percentage
    private int completedSyllabusTopics;              // Helps calculate the global percentage

}