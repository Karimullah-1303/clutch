package com.campus.identity.controller;

import com.campus.identity.dto.CollegeDto;
import com.campus.identity.entity.College;
import com.campus.identity.service.CollegeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * CollegeController
 * Manages the creation of high-level tenant (College) records.
 */
@RestController
@RequestMapping("/api/v1/colleges")
@RequiredArgsConstructor
public class CollegeController {

    private final CollegeService collegeService;

    @PostMapping
    public ResponseEntity<College> createCollege(@Valid @RequestBody CollegeDto request) {
        College newCollege = collegeService.createCollege(request.getName(), request.getDomain());
        return ResponseEntity.status(HttpStatus.CREATED).body(newCollege);
    }
}