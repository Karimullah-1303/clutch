package com.campus.academyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionHealthDto {
    private String subjectName;
    private String sectionName;
    private int totalClassesHeld;
    private double averageAttendancePercentage;
}