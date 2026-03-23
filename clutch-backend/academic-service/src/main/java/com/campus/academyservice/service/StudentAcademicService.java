package com.campus.academyservice.service;

import com.campus.academyservice.entity.StudentEnrollment;
import com.campus.academyservice.entity.TimetableBlock;
import com.campus.academyservice.repo.StudentEnrollmentRepository;
import com.campus.academyservice.repo.TimetableBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentAcademicService {

    private final StudentEnrollmentRepository enrollmentRepository;
    private final TimetableBlockRepository timetableRepository;

    public List<TimetableBlock> getTimetableForStudent(UUID studentId) {
        List<StudentEnrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        // 1. Look up the student in the Enrollment table to find their Sections (e.g., "CSE-A")
        List<String> enrolledSections = enrollments.stream()
                .map(enrollment -> enrollment.getSection().getName())
                .collect(Collectors.toList());

        // 2. If they aren't enrolled in anything, return an empty schedule
        if (enrolledSections.isEmpty()) {
            return Collections.emptyList();
        }

        // 3. Fetch all timetable entries for those specific sections
        return timetableRepository.findBySectionNameIn(enrolledSections);
    }
}
