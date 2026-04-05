package com.campus.academyservice.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class DepartmentProgressDto {
    private UUID teacherId;
    private String teacherName;
    private String subjectCode;
    private String subjectName;
    private String sectionName;

    private int syllabusPercentage;
    private String pacingStatus;
    private int currentLectureCount;
}