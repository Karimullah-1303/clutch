package com.campus.academyservice.service;

import com.campus.academyservice.entity.*;
import com.campus.academyservice.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * AcademicAdminService
 * Handles the bulk provisioning of the university's core academic data via CSV uploads.
 * Upgraded to multi-tenant architecture (dynamic college ID) and high-performance batch saving.
 */
@Service
@RequiredArgsConstructor
public class AcademicAdminService {

    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final TimetableBlockRepository timetableBlockRepository;
    private final StudentEnrollmentRepository enrollmentRepository;

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
}