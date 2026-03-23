package com.campus.academyservice.repo;

import com.campus.academyservice.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClassSessionRepository extends JpaRepository<ClassSession, UUID> {

    Optional<ClassSession> findByTimetableBlockIdAndSessionDate(UUID blockId, LocalDate date);

    // High-performance boolean check to see if a receipt exists for a specific class on a specific date
    // Used to render the "Submitted" vs "Take Attendance" buttons on the frontend.
    boolean existsByTimetableBlockIdAndSessionDate(UUID blockId, LocalDate sessionDate);

    List<ClassSession> findByTimetableBlockIdIn(List<UUID> timetableBlockIds);

    // Fetch all sessions taught by a specific teacher for a specific subject and section
    @Query("SELECT cs FROM ClassSession cs " +
            "JOIN cs.timetableBlock tb " +
            "WHERE tb.teacherId = :teacherId " +
            "AND tb.subject.id = :subjectId " +
            "AND tb.section.id = :sectionId " +
            "ORDER BY cs.sessionDate DESC")
    List<ClassSession> findTeacherPastSessions(
            @Param("teacherId") UUID teacherId,
            @Param("subjectId") UUID subjectId,
            @Param("sectionId") UUID sectionId);
}