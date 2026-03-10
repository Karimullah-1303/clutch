package com.campus.academyservice.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class DailyScheduleDto {
    private UUID blockId;
    private String subjectName;
    private String sectionName;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean isCompleted;
    private UUID sectionId;

    private int presentCount;
    private int totalEnrolled;
}