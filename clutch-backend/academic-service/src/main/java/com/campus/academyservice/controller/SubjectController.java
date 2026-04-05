package com.campus.academyservice.controller;

import com.campus.academyservice.entity.Subject;
import com.campus.academyservice.repo.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * SubjectController
 * Exposes simple CRUD endpoints for the Subject Catalog.
 */
@RestController
@RequestMapping("api/v1/subjects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SubjectController {

    private final SubjectRepository subjectRepository;

    @PostMapping(value = {"" , "/"})
    public ResponseEntity<Subject> createSubject(@RequestBody Subject subject) {
        return ResponseEntity.ok(subjectRepository.save(subject));
    }

    @GetMapping(value = {"" , "/"})
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectRepository.findAll());
    }
}