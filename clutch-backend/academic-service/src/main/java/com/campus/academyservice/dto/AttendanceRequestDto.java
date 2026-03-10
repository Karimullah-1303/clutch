package com.campus.academyservice.dto;

import com.campus.academyservice.entity.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AttendanceRequestDto {

    @NotNull(message = "Student ID cannot be null")
    private UUID studentId;

    @NotNull(message = "Block ID cannot be null")
    private UUID blockId;

    @NotNull(message = "Attendance status is required")
    private AttendanceStatus status;
}