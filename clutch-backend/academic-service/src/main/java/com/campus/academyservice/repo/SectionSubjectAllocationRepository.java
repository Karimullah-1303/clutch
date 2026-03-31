package com.campus.academyservice.repo;

import com.campus.academyservice.entity.SectionSubjectAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SectionSubjectAllocationRepository extends JpaRepository<SectionSubjectAllocation, UUID> {

    // The Magic Router Query: "For CSE-1 and CS3204, what is the real subject?"
    Optional<SectionSubjectAllocation> findBySectionNameAndTimetableSlotCode(String sectionName, String timetableSlotCode);
}