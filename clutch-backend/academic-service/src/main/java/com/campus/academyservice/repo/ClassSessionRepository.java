package com.campus.academyservice.repo;

import com.campus.academyservice.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
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
}