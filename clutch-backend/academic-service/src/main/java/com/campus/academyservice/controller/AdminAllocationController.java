package com.campus.academyservice.controller;

import com.campus.academyservice.dto.AllocationRequest;
import com.campus.academyservice.entity.SectionSubjectAllocation;
import com.campus.academyservice.repo.SectionSubjectAllocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/academic/admin/allocations")
@RequiredArgsConstructor
public class AdminAllocationController {

    private final SectionSubjectAllocationRepository allocationRepository;

    // POST /api/v1/academic/admin/allocations
    @PostMapping(value = {"", "/"})
    public ResponseEntity<SectionSubjectAllocation> createAllocation(@RequestBody AllocationRequest request) {
        SectionSubjectAllocation allocation = SectionSubjectAllocation.builder()
                .sectionName(request.getSectionName())
                .timetableSlotCode(request.getTimetableSlotCode())
                .actualSubjectCode(request.getActualSubjectCode())
                .build();

        return ResponseEntity.ok(allocationRepository.save(allocation));
    }
}