package com.campus.academyservice.controller;

import com.campus.academyservice.dto.ModuleDto;
import com.campus.academyservice.service.SyllabusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/academic/syllabus")
@RequiredArgsConstructor
public class SyllabusController {

    private final SyllabusService syllabusService;

    // Smart Route: GET /api/v1/academic/syllabus/CSE-1/CS3204
    @GetMapping("/{sectionName}/{slotCode}")
    public ResponseEntity<List<ModuleDto>> getSyllabus(
            @PathVariable String sectionName,
            @PathVariable String slotCode) {

        List<ModuleDto> syllabus = syllabusService.getSyllabusForClass(sectionName, slotCode);
        return ResponseEntity.ok(syllabus);
    }
}