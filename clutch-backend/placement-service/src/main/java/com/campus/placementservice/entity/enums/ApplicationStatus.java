package com.campus.placementservice.entity.enums;

public enum ApplicationStatus {
    APPLIED,     // Default state when a student clicks "Apply"
    SHORTLISTED, // Admin advances them
    SELECTED,    // The student got the offer!
    REJECTED     // The student was not selected
}