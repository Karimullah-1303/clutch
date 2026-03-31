package com.campus.academyservice.service;

import com.campus.academyservice.client.IdentityServiceClient;
import com.campus.academyservice.dto.DepartmentProgressDto;
import com.campus.academyservice.dto.SmartLessonPlanResponse;
import com.campus.academyservice.dto.TopicDto;
import com.campus.academyservice.entity.*;
import com.campus.academyservice.repo.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AcademicAdminService
 * Handles the bulk provisioning of the university's core academic data via CSV uploads.
 * Upgraded to multi-tenant architecture (dynamic college ID) and high-performance batch saving.
 */
@Service
@RequiredArgsConstructor
public class AcademicAdminService {

    @Value("${academic.semester.start-date}")
    private String semesterStartDateStr;

    private final TopicRepository topicRepository;
    private final LessonPlanTopicRepository lessonPlanTopicRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final TimetableBlockRepository timetableBlockRepository;
    private final StudentEnrollmentRepository enrollmentRepository;
    private final ClassSessionRepository classSessionRepository;
    private final LessonPlanService lessonPlanService;
    private final IdentityServiceClient userClient;

    /**
     * Parses and provisions the Subject Catalog (e.g., OOSE, DSA).
     */
    @Transactional
    public void processSubjectsCsv(MultipartFile file) {
        List<Subject> subjectsToSave = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            br.readLine(); // Skip header row: CourseCode,Name
            while ((line = br.readLine()) != null) {
                String[] data = line.split(",");
                if (data.length < 2) continue;

                Subject subject = new Subject();
                subject.setCourseCode(data[0].trim());
                subject.setName(data[1].trim());

                subjectsToSave.add(subject);
            }
            // 🚀 BATCH SAVE: Pushes all records to the DB in one shot
            subjectRepository.saveAll(subjectsToSave);

        } catch (Exception e) {
            throw new RuntimeException("CSV Error processing subjects: " + e.getMessage());
        }
    }

    /**
     * Parses and provisions the Timetable Blocks (The Blueprint).
     * Links a Teacher UUID to a specific Subject and Section on a specific day.
     */
    @Transactional
    public void processTimetableCsv(MultipartFile file, UUID collegeId) {
        List<TimetableBlock> blocksToSave = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            br.readLine(); // Skip header row
            while ((line = br.readLine()) != null) {
                String[] data = line.split(",");
                if (data.length < 6) continue;

                String subjectCode = data[0].trim();
                String sectionName = data[1].trim();
                UUID teacherId = UUID.fromString(data[2].trim());
                String day = data[3].trim().toUpperCase();
                LocalTime startTime = LocalTime.parse(data[4].trim());
                LocalTime endTime = LocalTime.parse(data[5].trim());

                // Resolve the relational Subject entity
                Subject subject = subjectRepository.findByCourseCode(subjectCode)
                        .orElseThrow(() -> new RuntimeException("Subject missing: " + subjectCode));

                // Lazy-initialization pattern: Auto-create the Section if it's the first time we've seen it!
                Section section = sectionRepository.findByName(sectionName)
                        .orElseGet(() -> {
                            Section newSection = new Section();
                            newSection.setName(sectionName);
                            newSection.setCollegeId(collegeId); // 🚨 Dynamic tenant ID injected here
                            return sectionRepository.save(newSection);
                        });

                // Assemble the Timetable Block relationship
                TimetableBlock block = new TimetableBlock();
                block.setSubject(subject);
                block.setSection(section);
                block.setTeacherId(teacherId);
                block.setDayOfWeek(day);
                block.setStartTime(startTime);
                block.setEndTime(endTime);

                blocksToSave.add(block);
            }
            // 🚀 BATCH SAVE
            timetableBlockRepository.saveAll(blocksToSave);

        } catch (Exception e) {
            throw new RuntimeException("CSV Error processing timetables: " + e.getMessage());
        }
    }

    /**
     * Parses and provisions the Student Roster mapping.
     * Links a Student UUID to a specific Section.
     */
    @Transactional
    public void processEnrollmentsCsv(MultipartFile file, UUID collegeId) {
        List<StudentEnrollment> enrollmentsToSave = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            br.readLine(); // Skip header row
            while ((line = br.readLine()) != null) {
                String[] data = line.split(",");
                if (data.length < 2) continue;

                UUID studentId = UUID.fromString(data[0].trim());
                String sectionName = data[1].trim();

                // Lazy-initialization pattern for Sections
                Section section = sectionRepository.findByName(sectionName)
                        .orElseGet(() -> {
                            Section newSection = new Section();
                            newSection.setName(sectionName);
                            newSection.setCollegeId(collegeId); // 🚨 Dynamic tenant ID injected here
                            return sectionRepository.save(newSection);
                        });

                // Assemble the Enrollment relationship
                StudentEnrollment enrollment = new StudentEnrollment();
                enrollment.setStudentId(studentId);
                enrollment.setSection(section);

                enrollmentsToSave.add(enrollment);
            }
            // 🚀 BATCH SAVE
            enrollmentRepository.saveAll(enrollmentsToSave);

        } catch (Exception e) {
            throw new RuntimeException("CSV Error processing enrollments: " + e.getMessage());
        }
    }


    public List<DepartmentProgressDto> getDepartmentHealthDashboard(String departmentId) {
        List<DepartmentProgressDto> dashboard = new ArrayList<>();
        List<Object[]> activeClasses = timetableBlockRepository.findDistinctClassAssignments();

        // 1. The Name Placeholder (Until we link the User Microservice)
        Set<UUID> uniqueTeacherIds = activeClasses.stream().map(row -> (UUID) row[0]).collect(Collectors.toSet());
        Map<UUID, String> teacherNames = new HashMap<>();

        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String token = request.getHeader("Authorization");


        try {
            // Call the User Service!
            teacherNames = userClient.getTeacherNames(token, uniqueTeacherIds);
        } catch (Exception e) {
            System.err.println("User Service is down! Falling back to UUIDs.");
            for (UUID id : uniqueTeacherIds) {
                teacherNames.put(id, "Prof. " + id.toString().substring(0, 4).toUpperCase());
            }
        }

        // 🚨 2. THE MEGA CACHES (This kills the N+1 Query lag!) 🚨
        Map<String, List<Topic>> syllabusCache = new HashMap<>();
        Map<String, Integer> completedSessionsCache = new HashMap<>();
        Map<String, Integer> classesPerWeekCache = new HashMap<>();
        Map<String, List<UUID>> historicallyCompletedTopicsCache = new HashMap<>();

        // Time-Series Base Variables
        java.time.LocalDate semesterStart = java.time.LocalDate.parse(semesterStartDateStr);
        long weeksPassed = Math.max(0, java.time.temporal.ChronoUnit.WEEKS.between(semesterStart, java.time.LocalDate.now()));

        for (Object[] row : activeClasses) {
            UUID teacherId = (UUID) row[0];
            String teacherName = teacherNames.getOrDefault(teacherId, "Unknown Professor");
            String subjectCode = (String) row[1];
            String subjectName = (String) row[2];
            String sectionName = (String) row[3];

            String cacheKey = subjectCode + "-" + sectionName;

            // A. Cached Syllabus Fetch
            if (!syllabusCache.containsKey(subjectCode)) {
                syllabusCache.put(subjectCode, topicRepository.findAllBySubjectCodeOrderedByTargetLecture(subjectCode));
            }
            List<Topic> allTopics = syllabusCache.get(subjectCode);
            int totalTopics = allTopics.size();

            // B. Cached Completed Topics Fetch
            if (!historicallyCompletedTopicsCache.containsKey(cacheKey)) {
                historicallyCompletedTopicsCache.put(cacheKey, lessonPlanTopicRepository.findHistoricallyCompletedTopicIds(subjectCode, sectionName));
            }
            List<UUID> completedIds = historicallyCompletedTopicsCache.get(cacheKey);
            int completedCount = completedIds.size();

            // C. Cached Completed Sessions
            if (!completedSessionsCache.containsKey(cacheKey)) {
                completedSessionsCache.put(cacheKey, classSessionRepository.countCompletedSessions(subjectCode, sectionName));
            }
            int currentLecCount = completedSessionsCache.get(cacheKey);

            // D. Cached Timetable Blocks (Classes Per Week)
            if (!classesPerWeekCache.containsKey(cacheKey)) {
                int count = 3; // fallback
                try {
                    count = timetableBlockRepository.countClassesPerWeek(subjectCode, sectionName);
                    if (count == 0) count = 3;
                } catch (Exception e) {}
                classesPerWeekCache.put(cacheKey, count);
            }
            int expectedLecturesSoFar = (int) (weeksPassed * classesPerWeekCache.get(cacheKey));

            // E. Calculate Math & Status
            int percentage = totalTopics > 0 ? (int) Math.round(((double) completedCount / totalTopics) * 100) : 0;
            String classHealthStatus = "UNMAPPED";

            Topic immediateNextTopic = allTopics.stream()
                    .filter(t -> !completedIds.contains(t.getId()))
                    .findFirst()
                    .orElse(null);

            if (percentage == 100 && totalTopics > 0) {
                classHealthStatus = "COMPLETED";
            } else if (immediateNextTopic != null && immediateNextTopic.getTargetLectureNumber() != null && immediateNextTopic.getTargetLectureNumber() > 0) {
                int assignedTarget = immediateNextTopic.getTargetLectureNumber();
                if (assignedTarget < expectedLecturesSoFar) {
                    classHealthStatus = "LAGGING";
                } else if (assignedTarget == expectedLecturesSoFar) {
                    classHealthStatus = "ON_TRACK";
                } else {
                    classHealthStatus = "ADVANCED";
                }
            }

            dashboard.add(DepartmentProgressDto.builder()
                    .teacherId(teacherId)
                    .teacherName(teacherName)
                    .subjectCode(subjectCode)
                    .subjectName(subjectName)
                    .sectionName(sectionName)
                    .syllabusPercentage(percentage)
                    .currentLectureCount(currentLecCount)
                    .pacingStatus(classHealthStatus)
                    .build());
        }

        return dashboard;
    }
}