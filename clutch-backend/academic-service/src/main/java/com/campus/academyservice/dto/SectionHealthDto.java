package com.campus.academyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionHealthDto {
    private UUID subjectId;
    private UUID sectionId;
    private String subjectName;
    private String sectionName;
    private int totalClassesHeld;
    private double averageAttendancePercentage;
}