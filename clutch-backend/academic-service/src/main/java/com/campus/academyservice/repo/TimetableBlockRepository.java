package com.campus.academyservice.repo;

import com.campus.academyservice.entity.TimetableBlock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TimetableBlockRepository extends JpaRepository<TimetableBlock, UUID> {
    List<TimetableBlock> findAllByTeacherId(UUID teacherId);

    // Filters the academic blueprint to find classes for a specific teacher on a specific day (e.g., "TUESDAY")
    List<TimetableBlock> findAllByTeacherIdAndDayOfWeek(UUID teacherId, String dayOfWeek);

    List<TimetableBlock> findAllBySectionId(UUID sectionId);

    List<TimetableBlock> findByTeacherId(UUID teacherId);

    List<TimetableBlock> findBySectionNameIn(List<String> sectionNames);
}