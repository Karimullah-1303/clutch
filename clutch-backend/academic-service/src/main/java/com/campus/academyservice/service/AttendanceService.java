package com.campus.academyservice.service;

import com.campus.academyservice.client.IdentityServiceClient;
import com.campus.academyservice.dto.*;
import com.campus.academyservice.entity.AttendanceRecord;
import com.campus.academyservice.entity.ClassSession;
import com.campus.academyservice.entity.Subject;
import com.campus.academyservice.entity.TimetableBlock;
import com.campus.academyservice.repo.AttendanceRecordRepository;
import com.campus.academyservice.repo.ClassSessionRepository;
import com.campus.academyservice.repo.TimetableBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.campus.academyservice.entity.enums.AttendanceStatus;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Core service handling all attendance-related business logic for the Academy Service.
 * This includes batch-saving attendance, calculating student-specific safe-to-skip metrics,
 * and aggregating teacher-level analytics.
 */
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final TimetableBlockRepository timetableBlockRepository;
    private final AttendanceRecordRepository attendanceRepo;
    private final ClassSessionRepository sessionRepo;
    private final IdentityServiceClient identityClient;

    /**
     * Records attendance for an entire class section in a single batch operation.
     * Ensures only authenticated TEACHER roles can perform this action.
     *
     * @param authHeader   The JWT token from the incoming request for role validation.
     * @param batchRequest DTO containing the block ID and list of student attendance statuses.
     */
    @Transactional
    public void markBatchAttendance(String authHeader, BatchAttendanceRequestDto batchRequest) {

        // 1. Cross-Microservice Security Check
        UserProfileDto user = identityClient.validateTokenAndGetUser(authHeader);
        if (!"TEACHER".equals(user.getRole())) {
            throw new RuntimeException("Security Violation: Only teachers can mark attendance");
        }

        // 2. Resolve or create today's session for this specific class block
        ClassSession session = sessionRepo.findByTimetableBlockIdAndSessionDate(batchRequest.getBlockId(), LocalDate.now())
                .orElseGet(() -> {
                    ClassSession newSession = new ClassSession();
                    newSession.setSessionDate(LocalDate.now());
                    TimetableBlock block = timetableBlockRepository.findById(batchRequest.getBlockId())
                            .orElseThrow(() -> new RuntimeException("Block not found"));
                    newSession.setTimetableBlock(block);
                    return sessionRepo.save(newSession);
                });

        List<AttendanceRecord> recordsToSave = new ArrayList<>();

        // 3. Process the incoming batch array against existing DB records
        for (BatchAttendanceRequestDto.StudentAttendanceDto studentData : batchRequest.getRecords()) {
            AttendanceRecord record = attendanceRepo.findByClassSessionIdAndStudentId(session.getId(), studentData.getStudentId())
                    .orElseGet(() -> {
                        AttendanceRecord newRecord = new AttendanceRecord();
                        newRecord.setClassSession(session);
                        newRecord.setStudentId(studentData.getStudentId());
                        return newRecord;
                    });

            record.setStatus(studentData.getStatus());
            recordsToSave.add(record);
        }

        // 4. Highly optimized bulk save to Postgres
        attendanceRepo.saveAll(recordsToSave);
    }

    /**
     * Calculates personalized attendance analytics for a specific student across all their enrolled subjects.
     * Computes the "Safe to Skip" or "Danger" math based on a 75% university requirement.
     *
     * @param studentId The UUID of the student.
     * @return A list of statistics broken down by subject.
     */
    public List<StudentSubjectStatDto> getStudentAttendanceStats(UUID studentId) {

        // Fetch all historical records for the student
        List<AttendanceRecord> allRecords = attendanceRepo.findByStudentId(studentId);

        // Group those records by Subject so we can analyze them individually
        Map<Subject, List<AttendanceRecord>> recordsBySubject = allRecords.stream()
                .collect(Collectors.groupingBy(record -> record.getClassSession().getTimetableBlock().getSubject()));

        List<StudentSubjectStatDto> statsList = new ArrayList<>();

        // Iterate through each subject to run the Clutch Attendance Math
        for (Map.Entry<Subject, List<AttendanceRecord>> entry : recordsBySubject.entrySet()) {
            Subject subject = entry.getKey();
            List<AttendanceRecord> records = entry.getValue();

            long totalAttended = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();

            // Query DB to see how many classes actually took place for this subject
            long totalHeld = attendanceRepo.countTotalSessionsBySubject(subject.getId());

            // Protect against division by zero at the start of a semester
            double currentPercentage = totalHeld == 0 ? 100.0 : ((double) totalAttended / totalHeld) * 100;
            currentPercentage = Math.round(currentPercentage * 100.0) / 100.0;

            int classesYouCanMiss = 0;
            int classesNeededToRecover = 0;
            String status;

            // Algorithm to determine attendance health and recovery metrics
            if (totalHeld == 0) {
                status = "SAFE";
            } else if (currentPercentage >= 75.0) {
                int safeToSkip = (int) Math.floor((totalAttended - (0.75 * totalHeld)) / 0.75);

                if (safeToSkip > 0) {
                    status = "SAFE";
                    classesYouCanMiss = safeToSkip;
                } else {
                    status = "WARNING";
                }
            } else {
                int classesNeeded = (int) Math.ceil(((0.75 * totalHeld) - totalAttended) / 0.25);
                status = "DANGER";
                classesNeededToRecover = classesNeeded;
            }

            // Build the final response payload for the frontend cards
            statsList.add(StudentSubjectStatDto.builder()
                    .subjectId(subject.getId())
                    .subjectName(subject.getName())
                    .totalHeld(totalHeld)
                    .totalAttended(totalAttended)
                    .currentPercentage(currentPercentage)
                    .status(status)
                    .classesYouCanMiss(classesYouCanMiss)
                    .classesNeededToRecover(classesNeededToRecover)
                    .build());
        }

        return statsList;
    }

    /**
     * Retrieves historical attendance data for a specific class on a specific date.
     * Used by the teacher to edit past attendance.
     *
     * @param blockId The UUID of the timetable block.
     * @param date    The historical date of the class session.
     * @return A list of attendance records, or an empty list if no session existed on that date.
     */
    public List<AttendanceRecordDto> getAttendanceForBlockAndDate(UUID blockId, LocalDate date) {
        Optional<ClassSession> sessionOpt = sessionRepo.findByTimetableBlockIdAndSessionDate(blockId, date);

        if (sessionOpt.isEmpty()) {
            return Collections.emptyList();
        }

        List<AttendanceRecord> records = attendanceRepo.findByClassSessionId(sessionOpt.get().getId());

        return records.stream()
                .map(r -> new AttendanceRecordDto(r.getStudentId(), r.getStatus()))
                .collect(Collectors.toList());
    }

    /**
     * Aggregates a massive, multi-dimensional analytics payload for a teacher's dashboard.
     * Calculates global averages, individual section health, and generates a hitlist
     * of at-risk students (hydrated with real names from the Identity Service).
     *
     * @param teacherId The UUID of the teacher.
     * @return A comprehensive analytics wrapper DTO.
     */
    public TeacherAnalyticsDto getTeacherAnalytics(UUID teacherId) {

        // 1. Resolve all blocks (classes) taught by this specific teacher
        List<TimetableBlock> blocks = timetableBlockRepository.findByTeacherId(teacherId);
        if (blocks.isEmpty()) {
            return TeacherAnalyticsDto.builder()
                    .globalAveragePercentage(0)
                    .totalClassesTaughtThisSemester(0)
                    .sectionHealthList(Collections.emptyList())
                    .atRiskStudents(Collections.emptyList())
                    .build();
        }

        List<UUID> blockIds = blocks.stream().map(TimetableBlock::getId).collect(Collectors.toList());

        // 2. Fetch all sessions held for those blocks
        List<ClassSession> sessions = sessionRepo.findByTimetableBlockIdIn(blockIds);
        List<UUID> sessionIds = sessions.stream().map(ClassSession::getId).collect(Collectors.toList());

        // 3. Fetch ALL attendance records for those sessions in one DB hit
        List<AttendanceRecord> allRecords = attendanceRepo.findByClassSessionIdIn(sessionIds);

        // --- GLOBAL STATS MATH ---
        int totalClassesTaught = sessions.size();
        long totalPresentGlobal = allRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        double globalAvg = allRecords.isEmpty() ? 0.0 : ((double) totalPresentGlobal / allRecords.size()) * 100;
        globalAvg = Math.round(globalAvg * 10.0) / 10.0; // Round to 1 decimal

        // --- SECTION HEALTH MATH ---
        List<SectionHealthDto> sectionHealthList = new ArrayList<>();

        // Group sessions by their respective Timetable Block (Section)
        Map<TimetableBlock, List<ClassSession>> sessionsByBlock = sessions.stream()
                .collect(Collectors.groupingBy(ClassSession::getTimetableBlock));

        for (Map.Entry<TimetableBlock, List<ClassSession>> entry : sessionsByBlock.entrySet()) {
            TimetableBlock block = entry.getKey();
            List<ClassSession> blockSessions = entry.getValue();

            List<UUID> blockSessionIds = blockSessions.stream().map(ClassSession::getId).collect(Collectors.toList());
            List<AttendanceRecord> blockRecords = allRecords.stream()
                    .filter(r -> blockSessionIds.contains(r.getClassSession().getId()))
                    .collect(Collectors.toList());

            long blockPresent = blockRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            double blockAvg = blockRecords.isEmpty() ? 0.0 : ((double) blockPresent / blockRecords.size()) * 100;

            sectionHealthList.add(SectionHealthDto.builder()
                    .subjectName(block.getSubject().getName())
                    .sectionName(block.getSection().getName())
                    .totalClassesHeld(blockSessions.size())
                    .averageAttendancePercentage(Math.round(blockAvg * 10.0) / 10.0)
                    .build());
        }

        // --- AT-RISK STUDENTS (The Hitlist) ---
        List<AtRiskStudentDto> atRiskList = new ArrayList<>();

        // Multi-level grouping: Group records by Student ID first, then by the Block (Class)
        Map<UUID, Map<TimetableBlock, List<AttendanceRecord>>> recordsByStudentAndBlock = allRecords.stream()
                .collect(Collectors.groupingBy(
                        AttendanceRecord::getStudentId,
                        Collectors.groupingBy(r -> r.getClassSession().getTimetableBlock())
                ));

        Set<UUID> atRiskStudentIds = new HashSet<>();

        // Analyze every student in every class to find sub-75% attendance
        for (Map.Entry<UUID, Map<TimetableBlock, List<AttendanceRecord>>> studentEntry : recordsByStudentAndBlock.entrySet()) {
            UUID sId = studentEntry.getKey();
            for (Map.Entry<TimetableBlock, List<AttendanceRecord>> blockEntry : studentEntry.getValue().entrySet()) {
                TimetableBlock block = blockEntry.getKey();
                List<AttendanceRecord> studentBlockRecords = blockEntry.getValue();

                long presentCount = studentBlockRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
                double studentAvg = ((double) presentCount / studentBlockRecords.size()) * 100;

                if (studentAvg < 75.0) {
                    atRiskStudentIds.add(sId);
                    atRiskList.add(AtRiskStudentDto.builder()
                            .studentId(sId)
                            .subjectName(block.getSubject().getName())
                            .sectionName(block.getSection().getName())
                            .currentPercentage(Math.round(studentAvg * 10.0) / 10.0)
                            .build());
                }
            }
        }

        // --- CROSS-MICROSERVICE DATA HYDRATION ---
        // We have UUIDs for failing students, but we need real names. Ask Identity Service.
        if (!atRiskStudentIds.isEmpty()) {
            try {
                // Batch fetch to avoid N+1 network calls
                List<UserProfileDto> identityUsers = identityClient.getUsersByIds(new ArrayList<>(atRiskStudentIds));
                Map<UUID, UserProfileDto> userMap = identityUsers.stream()
                        .collect(Collectors.toMap(UserProfileDto::getId, u -> u));

                // Map the retrieved names back onto our at-risk DTOs
                for (AtRiskStudentDto riskDto : atRiskList) {
                    UserProfileDto profile = userMap.get(riskDto.getStudentId());
                    if (profile != null) {
                        riskDto.setStudentName(profile.getName());
                        riskDto.setRollNumber(profile.getRollNumber());
                    } else {
                        riskDto.setStudentName("Unknown Student");
                        riskDto.setRollNumber("N/A");
                    }
                }
            } catch (Exception e) {
                // Fail gracefully so the dashboard still loads even if Identity Service drops the ball
                System.err.println("Failed to fetch student identities for At-Risk list: " + e.getMessage());
            }
        }

        // Sort the hitlist so the lowest percentage is at the top of the red-alert board
        atRiskList.sort(Comparator.comparingDouble(AtRiskStudentDto::getCurrentPercentage));

        return TeacherAnalyticsDto.builder()
                .globalAveragePercentage(globalAvg)
                .totalClassesTaughtThisSemester(totalClassesTaught)
                .sectionHealthList(sectionHealthList)
                .atRiskStudents(atRiskList)
                .build();
    }
}