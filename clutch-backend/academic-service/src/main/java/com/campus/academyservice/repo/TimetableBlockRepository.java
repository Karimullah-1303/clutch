package com.campus.academyservice.repo;

import com.campus.academyservice.entity.TimetableBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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


    @Query("SELECT DISTINCT tb.teacherId, tb.subject.courseCode, tb.subject.name, tb.section.name " +
            "FROM TimetableBlock tb")
    List<Object[]> findDistinctClassAssignments();



    @Query("SELECT COUNT(tb) FROM TimetableBlock tb WHERE tb.subject.courseCode = :subjectCode AND tb.section.name = :sectionName")
    int countClassesPerWeek(@Param("subjectCode") String subjectCode, @Param("sectionName") String sectionName);
}