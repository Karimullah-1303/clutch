package com.campus.academyservice.service;

import com.campus.academyservice.client.IdentityServiceClient;
import com.campus.academyservice.dto.*;
import com.campus.academyservice.entity.AttendanceRecord;
import com.campus.academyservice.entity.ClassSession;
import com.campus.academyservice.entity.Subject;
import com.campus.academyservice.entity.TimetableBlock;
import com.campus.academyservice.exception.InvalidDateException;
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

        LocalDate targetDate = batchRequest.getDate();
        LocalDate today = LocalDate.now();

        // 1. Cross-Microservice Security Check
        UserProfileDto user = identityClient.validateTokenAndGetUser(authHeader);
        if (!"TEACHER".equals(user.getRole())) {
            throw new RuntimeException("Security Violation: Only teachers can mark attendance");
        }

        // 2. The Time Engine Lock (Preventing Future and Distant Past edits)
        if (targetDate.isAfter(today)) {
            throw new InvalidDateException("Security Violation: Cannot submit attendance for future dates.");
        }
        if (targetDate.isBefore(today.minusDays(2))) {
            throw new InvalidDateException("Security Violation: The 48-hour grace period for this class has expired.");
        }

        // 3. Resolve or create the session for the EXACT date requested (Not just today!)
        ClassSession session = sessionRepo.findByTimetableBlockIdAndSessionDate(batchRequest.getBlockId(), targetDate)
                .orElseGet(() -> {
                    ClassSession newSession = new ClassSession();
                    newSession.setSessionDate(targetDate); // 🚨 FIXED

                    TimetableBlock block = timetableBlockRepository.findById(batchRequest.getBlockId())
                            .orElseThrow(() -> new RuntimeException("Block not found"));

                    newSession.setTimetableBlock(block);
                    return sessionRepo.save(newSession);
                });

        List<AttendanceRecord> recordsToSave = new ArrayList<>();

        // 4. Process the incoming batch array against existing DB records
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

        // 5. Highly optimized bulk save to Postgres
        attendanceRepo.saveAll(recordsToSave);
    }

    /**
     * Calculates personalized attendance analytics for a specific student.
     * Upgraded to use Predictive Semester Math for accurate "Safe to Skip" metrics.
     */
    public List<StudentSubjectStatDto> getStudentAttendanceStats(UUID studentId) {

        List<AttendanceRecord> allRecords = attendanceRepo.findByStudentId(studentId);

        Map<Subject, List<AttendanceRecord>> recordsBySubject = allRecords.stream()
                .collect(Collectors.groupingBy(record -> record.getClassSession().getTimetableBlock().getSubject()));

        List<StudentSubjectStatDto> statsList = new ArrayList<>();

        for (Map.Entry<Subject, List<AttendanceRecord>> entry : recordsBySubject.entrySet()) {
            Subject subject = entry.getKey();
            List<AttendanceRecord> records = entry.getValue();

            long totalAttended = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            long totalHeld = attendanceRepo.countTotalSessionsBySubject(subject.getId());

            double currentPercentage = totalHeld == 0 ? 100.0 : ((double) totalAttended / totalHeld) * 100;
            currentPercentage = Math.round(currentPercentage * 100.0) / 100.0;


            int classesYouCanMiss = 0;
            int classesNeededToRecover = 0;
            String status;

            if (totalHeld == 0) {
                status = "PENDING";
            } else if (currentPercentage >= 75.0) {
                // Formula: floor((4 * Attended - 3 * Held) / 3)
                classesYouCanMiss = (int) Math.floor((4 * totalAttended - 3 * totalHeld) / 3.0);

                if (classesYouCanMiss > 0) {
                    status = "SAFE";
                } else {
                    status = "WARNING"; // They are exactly at 75% or slightly above, 1 bunk drops them.
                }
            } else {
                // Formula: ceil(3 * Held - 4 * Attended)
                classesNeededToRecover = (int) Math.ceil(3 * totalHeld - 4 * totalAttended);

                // Real-world safety cap: If they need to attend 30 consecutive classes, it's likely impossible.
                // You can flag them as CRITICAL if the recovery number is absurdly high.
                if (classesNeededToRecover > 20) {
                    status = "CRITICAL";
                } else {
                    status = "DANGER";
                }
            }

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
    public TeacherAnalyticsDto getTeacherAnalytics(String authHeader, UUID teacherId) {

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

        // Group by Subject ID + Section ID to merge different time blocks of the same class
        Map<String, List<ClassSession>> sessionsBySubjectAndSection = sessions.stream()
                .collect(Collectors.groupingBy(session ->
                        session.getTimetableBlock().getSubject().getId().toString() + "_" +
                                session.getTimetableBlock().getSection().getId().toString()
                ));

        for (List<ClassSession> groupedSessions : sessionsBySubjectAndSection.values()) {
            TimetableBlock referenceBlock = groupedSessions.get(0).getTimetableBlock();
            List<UUID> groupedSessionIds = groupedSessions.stream().map(ClassSession::getId).collect(Collectors.toList());

            List<AttendanceRecord> groupedRecords = allRecords.stream()
                    .filter(r -> groupedSessionIds.contains(r.getClassSession().getId()))
                    .collect(Collectors.toList());

            long groupedPresent = groupedRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            double groupedAvg = groupedRecords.isEmpty() ? 0.0 : ((double) groupedPresent / groupedRecords.size()) * 100;

            sectionHealthList.add(SectionHealthDto.builder()
                    .subjectId(referenceBlock.getSubject().getId())
                    .sectionId(referenceBlock.getSection().getId())
                    .subjectName(referenceBlock.getSubject().getName())
                    .sectionName(referenceBlock.getSection().getName())
                    .totalClassesHeld(groupedSessions.size()) // 🚨 Now properly counts all merged sessions
                    .averageAttendancePercentage(Math.round(groupedAvg * 10.0) / 10.0)
                    .build());
        }

        // --- AT-RISK STUDENTS (The Hitlist) ---
        List<AtRiskStudentDto> atRiskList = new ArrayList<>();

        //  Multi-level grouping: Group by Student ID first, then by Subject_Section string key
        Map<UUID, Map<String, List<AttendanceRecord>>> recordsByStudentAndSubject = allRecords.stream()
                .collect(Collectors.groupingBy(
                        AttendanceRecord::getStudentId,
                        Collectors.groupingBy(r ->
                                r.getClassSession().getTimetableBlock().getSubject().getId().toString() + "_" +
                                        r.getClassSession().getTimetableBlock().getSection().getId().toString()
                        )
                ));

        Set<UUID> atRiskStudentIds = new HashSet<>();

        // Analyze every student in every merged class to find sub-75% attendance
        for (Map.Entry<UUID, Map<String, List<AttendanceRecord>>> studentEntry : recordsByStudentAndSubject.entrySet()) {
            UUID sId = studentEntry.getKey();
            for (Map.Entry<String, List<AttendanceRecord>> subjectEntry : studentEntry.getValue().entrySet()) {

                List<AttendanceRecord> studentSubjectRecords = subjectEntry.getValue();
                TimetableBlock referenceBlock = studentSubjectRecords.get(0).getClassSession().getTimetableBlock();

                long presentCount = studentSubjectRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
                double studentAvg = ((double) presentCount / studentSubjectRecords.size()) * 100;

                if (studentAvg < 75.0) {
                    atRiskStudentIds.add(sId);
                    atRiskList.add(AtRiskStudentDto.builder()
                            .studentId(sId)
                            .subjectId(referenceBlock.getSubject().getId())
                            .sectionId(referenceBlock.getSection().getId())
                            .subjectName(referenceBlock.getSubject().getName())
                            .sectionName(referenceBlock.getSection().getName())
                            .currentPercentage(Math.round(studentAvg * 10.0) / 10.0)
                            .build());
                }
            }
        }

        // --- CROSS-MICROSERVICE DATA HYDRATION ---
        if (!atRiskStudentIds.isEmpty()) {
            try {
                List<UserProfileDto> identityUsers = identityClient.getUsersByIds(authHeader, new ArrayList<>(atRiskStudentIds));
                Map<UUID, UserProfileDto> userMap = identityUsers.stream()
                        .collect(Collectors.toMap(UserProfileDto::getId, u -> u));

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
                System.err.println("Failed to fetch student identities for At-Risk list: " + e.getMessage());
            }
        }

        atRiskList.sort(Comparator.comparingDouble(AtRiskStudentDto::getCurrentPercentage));

        return TeacherAnalyticsDto.builder()
                .globalAveragePercentage(globalAvg)
                .totalClassesTaughtThisSemester(totalClassesTaught)
                 .sectionHealthList(sectionHealthList)
                .atRiskStudents(atRiskList)
                .build();
    }


    /**
     * Fetches session records and hydrates them with real student names from Identity Service.
     */
    public List<Map<String, Object>> getSessionAttendanceDetailsWithNames(String authHeader, UUID sessionId) {
        // 1. Fetch the raw UUIDs and statuses from the database
        List<Map<String, Object>> rawRecords = attendanceRepo.findStudentRecordsBySessionId(sessionId);
        if (rawRecords.isEmpty()) return rawRecords;

        // 2. Extract just the UUIDs to send to Identity Service
        List<UUID> studentIds = rawRecords.stream()
                .map(r -> (UUID) r.get("studentId"))
                .collect(Collectors.toList());

        List<Map<String, Object>> enrichedRecords = new ArrayList<>();

        try {
            // 3. Ask Identity Service for the names
            List<UserProfileDto> identityUsers = identityClient.getUsersByIds(authHeader, studentIds);
            Map<UUID, String> nameMap = identityUsers.stream()
                    .collect(Collectors.toMap(UserProfileDto::getId, UserProfileDto::getName));

            // 4. Merge the names into a new response list
            for (Map<String, Object> record : rawRecords) {
                Map<String, Object> enriched = new HashMap<>(record); // Create mutable copy
                UUID sId = (UUID) record.get("studentId");
                enriched.put("studentName", nameMap.getOrDefault(sId, "Unknown Student"));
                enrichedRecords.add(enriched);
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch names for session records: " + e.getMessage());
            // Fallback: If Identity service is down, just return them as "Unknown" so the UI doesn't crash
            for (Map<String, Object> record : rawRecords) {
                Map<String, Object> fallback = new HashMap<>(record);
                fallback.put("studentName", "Unknown Student");
                enrichedRecords.add(fallback);
            }
        }

        return enrichedRecords;
    }


}