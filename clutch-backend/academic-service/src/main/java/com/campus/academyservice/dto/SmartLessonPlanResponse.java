package com.campus.academyservice.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class SmartLessonPlanResponse {
    private List<UUID> historicallyCompletedTopicIds;
    private List<TopicDto> todaysTargets;
    private List<TopicDto> carryoverTopics;
    private int totalSyllabusTopics;
    private int completedSyllabusTopics;
}