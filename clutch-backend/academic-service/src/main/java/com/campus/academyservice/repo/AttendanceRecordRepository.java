package com.campus.academyservice.repo;

import com.campus.academyservice.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Data Access Object for Attendance Records.
 * Uses highly optimized JPQL queries to offload mathematical aggregations to the database engine.
 */
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    // ARCHITECTURE WIN: Make Postgres count the total classes a student has attended.
    // This is infinitely faster than pulling List<AttendanceRecord> into Java and running .size()
    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE a.studentId = :studentId " +
            "AND a.classSession.timetableBlock.subject.id = :subjectId " +
            "AND a.status = 'PRESENT'")
    long countAttendedByStudentAndSubject(@Param("studentId") UUID studentId, @Param("subjectId") UUID subjectId);

    // Make Postgres count the total classes HELD for that subject so far
    @Query("SELECT COUNT(c) FROM ClassSession c WHERE c.timetableBlock.subject.id = :subjectId")
    long countTotalSessionsBySubject(@Param("subjectId") UUID subjectId);

    Optional<AttendanceRecord> findByClassSessionIdAndStudentId(UUID sessionId, UUID studentId);

    List<AttendanceRecord> findByClassSessionId(UUID classSessionId);

    List<AttendanceRecord> findByStudentId(UUID studentId);

    // Fetches a massive batch of AttendanceRecords using a list of session IDs
    List<AttendanceRecord> findByClassSessionIdIn(List<UUID> classSessionIds);


    @Query("SELECT new map(cs.sessionDate as date, tb.dayOfWeek as day, ar.status as status) " +
            "FROM AttendanceRecord ar " +
            "JOIN ar.classSession cs " +
            "JOIN cs.timetableBlock tb " +
            "WHERE ar.studentId = :studentId AND tb.subject.id = :subjectId " +
            "ORDER BY cs.sessionDate DESC")
    List<java.util.Map<String, Object>> findStudentSubjectDetails(
            @Param("studentId") UUID studentId,
            @Param("subjectId") UUID subjectId);


    // Fetch detailed student records for a specific class session
    @Query("SELECT new map(ar.studentId as studentId, ar.status as status) " +
            "FROM AttendanceRecord ar WHERE ar.classSession.id = :sessionId")
    List<java.util.Map<String, Object>> findStudentRecordsBySessionId(
            @Param("sessionId") UUID sessionId);
}