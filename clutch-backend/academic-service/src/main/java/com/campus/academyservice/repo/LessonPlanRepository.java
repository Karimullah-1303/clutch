package com.campus.academyservice.repo;

import com.campus.academyservice.entity.LessonPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LessonPlanRepository extends JpaRepository<LessonPlan, UUID> {

    // Useful for the mobile dashboard: "Show me all my plans for today"
    List<LessonPlan> findByTeacherIdAndClassDateOrderByStartTimeAsc(UUID teacherId, LocalDate classDate);

    // Useful for checking if a teacher already made a plan for a specific slot before creating a new one
    Optional<LessonPlan> findByTeacherIdAndSubjectCodeAndSectionNameAndClassDate(
            UUID teacherId, String subjectCode, String sectionName, LocalDate classDate);


}