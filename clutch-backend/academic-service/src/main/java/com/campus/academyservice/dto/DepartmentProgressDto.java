package com.campus.academyservice.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class DepartmentProgressDto {
    private UUID teacherId;
    private String teacherName;      // e.g., "Dr. Sharma"
    private String subjectCode;      // e.g., "CS3201"
    private String subjectName;      // e.g., "OOSE"
    private String sectionName;      // e.g., "CSE-2"

    private int syllabusPercentage;  // e.g., 42
    private String pacingStatus;     // "LAGGING", "ON_TRACK", "ADVANCED", or "UNMAPPED"
    private int currentLectureCount; // How many classes they've actually held
}