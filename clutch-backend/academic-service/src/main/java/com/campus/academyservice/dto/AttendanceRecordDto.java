package com.campus.academyservice.dto;

import com.campus.academyservice.entity.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceRecordDto {
    private UUID studentId;
    private AttendanceStatus status;
}