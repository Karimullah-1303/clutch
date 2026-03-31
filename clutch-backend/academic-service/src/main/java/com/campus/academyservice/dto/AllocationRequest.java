package com.campus.academyservice.dto;

import lombok.Data;

@Data
public class AllocationRequest {
    private String sectionName;
    private String timetableSlotCode;
    private String actualSubjectCode;
}