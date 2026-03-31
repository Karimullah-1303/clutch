package com.campus.academyservice.controller;

import com.campus.academyservice.dto.LessonPlanRequest;
import com.campus.academyservice.dto.LessonPlanResponse;
import com.campus.academyservice.dto.SmartLessonPlanResponse;
import com.campus.academyservice.entity.LessonPlan;
import com.campus.academyservice.service.LessonPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/academic/lesson-plans")
@RequiredArgsConstructor
public class LessonPlanController {

    private final LessonPlanService lessonPlanService;

    // Example Frontend Call: GET /api/v1/academic/lesson-plans/today?teacherId=d62d8fb3...&date=2026-03-24
    @GetMapping("/daily")
    public ResponseEntity<List<LessonPlanResponse>> getDailyPlans(
            @RequestParam UUID teacherId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<LessonPlanResponse> plans = lessonPlanService.getDailyPlansForTeacher(teacherId, date);
        return ResponseEntity.ok(plans);
    }

    // Example Frontend Call: POST /api/v1/academic/lesson-plans
    @PostMapping
    public ResponseEntity<LessonPlan> createPlan(@RequestBody LessonPlanRequest request) {
        LessonPlan createdPlan = lessonPlanService.createLessonPlan(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPlan);
    }

    // Example Frontend Call: PUT /api/v1/academic/lesson-plans/550e8400-e29b-41d4-a716-446655440000
    @PutMapping("/{planId}")
    public ResponseEntity<LessonPlan> updatePlan(
            @PathVariable UUID planId,
            @RequestBody LessonPlanRequest request) {

        LessonPlan updatedPlan = lessonPlanService.updateLessonPlan(planId, request);
        return ResponseEntity.ok(updatedPlan);
    }


    @GetMapping("/smart-target")
    public ResponseEntity<SmartLessonPlanResponse> getSmartTarget(
            @RequestParam String sectionName,
            @RequestParam String subjectCode,
            @RequestParam String timetableSlotCode) {

        SmartLessonPlanResponse response = lessonPlanService
                .getSmartTargetsForClass(sectionName, subjectCode, timetableSlotCode);

        return ResponseEntity.ok(response);
    }
}