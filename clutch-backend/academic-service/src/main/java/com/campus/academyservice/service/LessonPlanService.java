package com.campus.academyservice.service;

import com.campus.academyservice.dto.*;
import com.campus.academyservice.entity.LessonPlan;
import com.campus.academyservice.entity.LessonPlanTopic;
import com.campus.academyservice.repo.ClassSessionRepository;
import com.campus.academyservice.repo.LessonPlanRepository;
import com.campus.academyservice.repo.LessonPlanTopicRepository;
import com.campus.academyservice.repo.TimetableBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LessonPlanService {

    @Value("${academic.semester.start-date}")
    private String semesterStartDateStr;

    private final TimetableBlockRepository timetableBlockRepository;
    private final ClassSessionRepository classSessionRepository;
    private final SyllabusService syllabusService;
    private final LessonPlanRepository lessonPlanRepository;
    private final LessonPlanTopicRepository lessonPlanTopicRepository;

    public List<LessonPlanResponse> getDailyPlansForTeacher(UUID teacherId, LocalDate date) {
        List<LessonPlan> plans = lessonPlanRepository.findByTeacherIdAndClassDateOrderByStartTimeAsc(teacherId, date);

        return plans.stream().map(plan -> {
            List<LessonPlanTopic> allLinkedTopics = lessonPlanTopicRepository.findByLessonPlanId(plan.getId());

            List<UUID> completedIds = allLinkedTopics.stream()
                    .filter(t -> "COMPLETED".equals(t.getCoverageStatus()))
                    .map(LessonPlanTopic::getTopicId)
                    .toList();

            List<UUID> pushedIds = allLinkedTopics.stream()
                    .filter(t -> "PUSHED".equals(t.getCoverageStatus()))
                    .map(LessonPlanTopic::getTopicId)
                    .toList();

            return LessonPlanResponse.builder()
                    .id(plan.getId())
                    .subjectCode(plan.getSubjectCode())
                    .sectionName(plan.getSectionName())
                    .classDate(plan.getClassDate())
                    .notes(plan.getNotes())
                    .homework(plan.getHomework())
                    .status(plan.getStatus())
                    .completedTopicIds(completedIds)
                    .pushedTopicIds(pushedIds)
                    .build();
        }).toList();
    }

    @Transactional
    public LessonPlan createLessonPlan(LessonPlanRequest request) {
        LessonPlan plan = LessonPlan.builder()
                .teacherId(request.getTeacherId())
                .subjectCode(request.getSubjectCode())
                .sectionName(request.getSectionName())
                .classDate(request.getClassDate())
                .startTime(request.getStartTime())
                .notes(request.getNotes())
                .homework(request.getHomework())
                .status(request.getStatus() != null ? request.getStatus() : "PLANNED")
                .build();

        LessonPlan savedPlan = lessonPlanRepository.save(plan);

        if (request.getPushedTopicIds() != null && !request.getPushedTopicIds().isEmpty()) {
            List<LessonPlanTopic> pushedTopics = request.getPushedTopicIds().stream()
                    .map(topicId -> LessonPlanTopic.builder()
                            .lessonPlanId(savedPlan.getId())
                            .topicId(topicId)
                            .coverageStatus("PUSHED")
                            .build())
                    .toList();

            lessonPlanTopicRepository.saveAll(pushedTopics);
        }

        return savedPlan;
    }

    @Transactional
    public LessonPlan updateLessonPlan(UUID planId, LessonPlanRequest request) {
        LessonPlan existingPlan = lessonPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Lesson Plan not found"));

        existingPlan.setNotes(request.getNotes());
        existingPlan.setHomework(request.getHomework());
        if (request.getStatus() != null) {
            existingPlan.setStatus(request.getStatus());
        }

        if (request.getCompletedTopicIds() != null) {
            List<LessonPlanTopic> oldTopics = lessonPlanTopicRepository.findByLessonPlanId(planId);
            lessonPlanTopicRepository.deleteAll(oldTopics);
            lessonPlanTopicRepository.flush();

            if (!request.getCompletedTopicIds().isEmpty()) {
                List<LessonPlanTopic> newTopics = request.getCompletedTopicIds().stream()
                        .map(topicId -> LessonPlanTopic.builder()
                                .lessonPlanId(planId)
                                .topicId(topicId)
                                .coverageStatus("COMPLETED")
                                .build())
                        .toList();
                lessonPlanTopicRepository.saveAll(newTopics);
            }
        }

        return lessonPlanRepository.save(existingPlan);
    }

    public SmartLessonPlanResponse getSmartTargetsForClass(String sectionName, String subjectCode, String timetableSlotCode) {

        List<UUID> completedIds = lessonPlanTopicRepository.findHistoricallyCompletedTopicIds(subjectCode, sectionName);
        List<UUID> carryoverIds = lessonPlanTopicRepository.findActiveCarryoverTopicIds(subjectCode, sectionName);

        List<ModuleDto> fullSyllabus = syllabusService.getSyllabusForClass(sectionName, timetableSlotCode);
        List<TopicDto> allChronologicalTopics = fullSyllabus.stream()
                .flatMap(module -> module.getTopics().stream())
                .toList();

        List<TopicDto> carryoverTopics = allChronologicalTopics.stream()
                .filter(topic -> carryoverIds.contains(topic.getId())).toList();

        List<TopicDto> freshTargets = allChronologicalTopics.stream()
                .filter(topic -> !completedIds.contains(topic.getId()) && !carryoverIds.contains(topic.getId()))
                .limit(3).toList();

        List<TopicDto> finalTodaysTargets = new java.util.ArrayList<>();
        finalTodaysTargets.addAll(carryoverTopics);
        finalTodaysTargets.addAll(freshTargets);

        // Pass every target through the True Time-Series Pacer!
        for (TopicDto target : finalTodaysTargets) {
            applyTimeSeriesPacing(target, subjectCode, sectionName);
        }

        return SmartLessonPlanResponse.builder()
                .historicallyCompletedTopicIds(completedIds)
                .todaysTargets(finalTodaysTargets)
                .carryoverTopics(carryoverTopics)
                .totalSyllabusTopics(allChronologicalTopics.size())
                .completedSyllabusTopics(completedIds.size())
                .build();
    }

    //  THE TEACHER PACING CALCULATOR
    private void applyTimeSeriesPacing(TopicDto dto, String subjectCode, String sectionName) {
        if (dto.getTargetLectureNumber() == null || dto.getTargetLectureNumber() == 0) {
            dto.setPacingStatus("UNMAPPED");
            dto.setPacingOffset(0);
            return;
        }

        java.time.LocalDate semesterStart = java.time.LocalDate.parse(semesterStartDateStr);
        long weeksPassed = Math.max(0, java.time.temporal.ChronoUnit.WEEKS.between(semesterStart, java.time.LocalDate.now()));

        int classesPerWeek = 3;
        try {
            classesPerWeek = timetableBlockRepository.countClassesPerWeek(subjectCode, sectionName);
            if (classesPerWeek == 0) classesPerWeek = 3;
        } catch (Exception e) {}

        int expectedLecturesSoFar = (int) (weeksPassed * classesPerWeek);
        int assignedTarget = dto.getTargetLectureNumber();

        int offset = expectedLecturesSoFar - assignedTarget;

        if (offset > 0) {
            dto.setPacingStatus("LAGGING");
            dto.setPacingOffset(offset);
        } else if (offset == 0) {
            dto.setPacingStatus("ON_TRACK");
            dto.setPacingOffset(0);
        } else {
            dto.setPacingStatus("ADVANCED");
            dto.setPacingOffset(Math.abs(offset));
        }
    }
}