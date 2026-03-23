package com.campus.placementservice.controller;

import com.campus.placementservice.entity.Notification;
import com.campus.placementservice.repo.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/placement/student")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping("/{studentId}/notifications")
    public ResponseEntity<List<Notification>> getMyNotifications(@PathVariable UUID studentId) {
        // Fetches notifications sorted by newest first
        return ResponseEntity.ok(notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId));
    }
}