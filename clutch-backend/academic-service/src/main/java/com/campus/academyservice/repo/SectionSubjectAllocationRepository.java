package com.campus.academyservice.repo;

import com.campus.academyservice.entity.SectionSubjectAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SectionSubjectAllocationRepository extends JpaRepository<SectionSubjectAllocation, UUID> {

        Optional<SectionSubjectAllocation> findBySectionNameAndTimetableSlotCode(String sectionName, String timetableSlotCode);
}