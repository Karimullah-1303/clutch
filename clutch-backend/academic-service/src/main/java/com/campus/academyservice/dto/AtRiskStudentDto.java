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
public class AtRiskStudentDto {
    private UUID studentId;
    private UUID subjectId;
    private UUID sectionId;
    private String studentName;
    private String rollNumber;
    private String subjectName;
    private String sectionName;
    private double currentPercentage;
}