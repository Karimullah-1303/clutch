package com.campus.academyservice.repo;

import com.campus.academyservice.entity.StudentEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StudentEnrollmentRepository extends JpaRepository<StudentEnrollment, UUID> {
    List<StudentEnrollment> findAllBySectionId(UUID sectionId);
    List<StudentEnrollment> findByStudentId(UUID studentId);
}