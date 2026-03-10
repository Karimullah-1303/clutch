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
public class StudentSubjectStatDto {
    private UUID subjectId;
    private String subjectName;
    private long totalHeld;
    private long totalAttended;
    private double currentPercentage;

    // The Clutch Math variables
    private String status;
    private int classesYouCanMiss;
    private int classesNeededToRecover;
}