package com.campus.academyservice.controller;

import com.campus.academyservice.dto.DailyScheduleDto;
import com.campus.academyservice.entity.AttendanceRecord;
import com.campus.academyservice.entity.ClassSession;
import com.campus.academyservice.entity.TimetableBlock;
import com.campus.academyservice.entity.enums.AttendanceStatus;
import com.campus.academyservice.repo.AttendanceRecordRepository;
import com.campus.academyservice.repo.ClassSessionRepository;
import com.campus.academyservice.repo.TimetableBlockRepository;
import com.campus.academyservice.service.StudentAcademicService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * TimetableBlockController
 * Manages the "Blueprints" (TimetableBlocks) of the university schedule and powers
 * the Teacher's daily operational view.
 */
@RestController
@RequestMapping("/api/v1/blocks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TimetableBlockController {

    private final TimetableBlockRepository blockRepository;
    private final ClassSessionRepository sessionRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final StudentAcademicService studentAcademicService;
    @PostMapping
    public ResponseEntity<TimetableBlock> createBlock(@RequestBody TimetableBlock block) {
        return ResponseEntity.ok(blockRepository.save(block));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<TimetableBlock>> getBlocksForTeacher(@PathVariable UUID teacherId) {
        return ResponseEntity.ok(blockRepository.findAllByTeacherId(teacherId));
    }

    /**
     * The core endpoint for the Teacher Dashboard.
     * Takes a requested calendar date, determines the day of the week, fetches the blueprint classes,
     * and evaluates if a session receipt (attendance record) already exists for that specific date.
     */
    @GetMapping("/teacher/{teacherId}/daily-schedule")
    public ResponseEntity<List<DailyScheduleDto>> getDailySchedule(
            @PathVariable UUID teacherId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        // 1. Resolve the requested calendar date to an enumerated day (e.g., "MONDAY")
        String dayOfWeek = date.getDayOfWeek().name().substring(0,3);

        // 2. Fetch the "Blueprint" classes scheduled for this day
        List<TimetableBlock> blocksToday = blockRepository.findAllByTeacherIdAndDayOfWeek(teacherId, dayOfWeek);

        // 3. Assemble the dynamic UI DTO payload
        List<DailyScheduleDto> schedule = blocksToday.stream().map(block -> {

            // MAGIC CHECK: Does a real historical session exist for this blueprint on this exact date?
            boolean isDone = sessionRepository.existsByTimetableBlockIdAndSessionDate(block.getId(), date);

            int present = 0;
            int total = 0;

            if (isDone) {
                // If the class occurred, retrieve the specific session receipt
                ClassSession session = sessionRepository.findByTimetableBlockIdAndSessionDate(block.getId(), date).get();

                // Retrieve all attendance entries mapped to this session
                List<AttendanceRecord> records = attendanceRepository.findByClassSessionId(session.getId());

                // Calculate the specific health metrics for the UI Dashboard cards
                total = records.size();
                present = (int) records.stream()
                        .filter(r -> r.getStatus() == AttendanceStatus.PRESENT)
                        .count();
            }

            return DailyScheduleDto.builder()
                    .blockId(block.getId())
                    .subjectName(block.getSubject().getName())
                    .sectionName(block.getSection().getName())
                    .startTime(block.getStartTime())
                    .endTime(block.getEndTime())
                    .isCompleted(isDone) // Controls the UI rendering of the green "Submitted (Edit)" badge
                    .sectionId(block.getSection().getId())
                    .presentCount(present)
                    .totalEnrolled(total)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(schedule);
    }

    @GetMapping("student/{studentId}/timetable")
    public ResponseEntity<List<TimetableBlock>> getStudentTimetable(@PathVariable UUID studentId) {
        return ResponseEntity.ok(studentAcademicService.getTimetableForStudent(studentId));
    }
}