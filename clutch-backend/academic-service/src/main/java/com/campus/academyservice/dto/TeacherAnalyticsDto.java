package com.campus.academyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherAnalyticsDto {
    private double globalAveragePercentage;
    private int totalClassesTaughtThisSemester;
    private List<SectionHealthDto> sectionHealthList;
    private List<AtRiskStudentDto> atRiskStudents;
}