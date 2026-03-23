package com.campus.academyservice.controller;

import com.campus.academyservice.dto.AttendanceRecordDto;
import com.campus.academyservice.dto.BatchAttendanceRequestDto;
import com.campus.academyservice.dto.StudentSubjectStatDto;
import com.campus.academyservice.dto.TeacherAnalyticsDto;
import com.campus.academyservice.entity.ClassSession;
import com.campus.academyservice.repo.AttendanceRecordRepository;
import com.campus.academyservice.repo.ClassSessionRepository;
import com.campus.academyservice.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * AttendanceController
 * The primary API Gateway for all attendance-related operations.
 * Routes traffic from the React frontend to the heavy-lifting AttendanceService.
 */
@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceRecordRepository  attendanceRecordRepository;
    private final ClassSessionRepository   classSessionRepository;

    /**
     * --- TEACHER ACTION: Mark Attendance ---
     * Accepts a bulk payload of student attendance statuses for a specific class session.
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> submitBatchAttendance(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody BatchAttendanceRequestDto batchRequest) {

        // Delegate execution to the transactional service layer
        attendanceService.markBatchAttendance(authHeader, batchRequest);

        return ResponseEntity.ok(Map.of("message", "Batch attendance recorded successfully!"));
    }

    /**
     * --- STUDENT ACTION: Get Dashboard Summary ---
     * Returns the pre-calculated, aggregated attendance statistics for a specific student.
     */
    @GetMapping("/student/{studentId}/summary")
    public ResponseEntity<List<StudentSubjectStatDto>> getStudentSummary(@PathVariable UUID studentId) {

        // One clean call to the service that returns the full array of stats for every subject!
        List<StudentSubjectStatDto> stats = attendanceService.getStudentAttendanceStats(studentId);
        return ResponseEntity.ok(stats);
    }

    /**
     * --- TEACHER ACTION: Edit Attendance History ---
     * Retrieves historical attendance records so a teacher can correct past mistakes.
     */
    @GetMapping("/block/{blockId}")
    public ResponseEntity<List<AttendanceRecordDto>> getAttendanceForBlock(
            @PathVariable UUID blockId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<AttendanceRecordDto> records = attendanceService.getAttendanceForBlockAndDate(blockId, date);
        return ResponseEntity.ok(records);
    }

    /**
     * --- TEACHER ACTION: Get Analytics Hub ---
     * Fetches the massive data aggregate for the Teacher Analytics dashboard.
     */
    @GetMapping("/teacher/{teacherId}/analytics")
    public ResponseEntity<TeacherAnalyticsDto> getTeacherAnalytics(
            @RequestHeader("Authorization") String authHeader, // <-- GRAB THE TOKEN
            @PathVariable UUID teacherId) {

        // Pass the token down to the service layer
        return ResponseEntity.ok(attendanceService.getTeacherAnalytics(authHeader, teacherId));
    }

    @GetMapping("/student/{studentId}/subject/{subjectId}/details")
    public ResponseEntity<List<java.util.Map<String, Object>>> getSubjectDetails(
            @PathVariable UUID studentId,
            @PathVariable UUID subjectId) {
        return ResponseEntity.ok(attendanceRecordRepository.findStudentSubjectDetails(studentId, subjectId));
    }


    // 1. Endpoint to get the dates when the card is clicked
    @GetMapping("/teacher/{teacherId}/subject/{subjectId}/section/{sectionId}/sessions")
    public ResponseEntity<List<ClassSession>> getTeacherPastSessions(
            @PathVariable UUID teacherId,
            @PathVariable UUID subjectId,
            @PathVariable UUID sectionId) {
        return ResponseEntity.ok(classSessionRepository.findTeacherPastSessions(teacherId, subjectId, sectionId));
    }

    // 2. Endpoint to get the student list when a specific date is clicked
    @GetMapping("/session/{sessionId}/records")
    public ResponseEntity<List<java.util.Map<String, Object>>> getSessionAttendanceDetails(
            @RequestHeader("Authorization") String authHeader, // 🚨 Added to pass to Identity
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(attendanceService.getSessionAttendanceDetailsWithNames(authHeader, sessionId));
    }
}