package com.campus.academyservice.dto;

import com.campus.academyservice.entity.enums.AttendanceStatus;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class BatchAttendanceRequestDto {
    private LocalDate date;
    private UUID blockId;
    private List<StudentAttendanceDto> records; // The list of students!

    @Data
    public static class StudentAttendanceDto {
        private UUID studentId;
        private AttendanceStatus status;
    }
}