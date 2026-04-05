package com.campus.identity.service;

import com.campus.identity.entity.*;
import com.campus.identity.entity.enums.Role;
import com.campus.identity.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * AdminService
 * Handles bulk administrative tasks for the Identity Service, specifically parsing
 * CSV files to provision new user accounts en masse.
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Parses a CSV file to bulk-create user accounts (Students, Teachers, Admins).
     * Applies a default password hash and associates them with the dynamic university tenant.
     */
    @Transactional
    public void processUsersCsv(MultipartFile file, UUID collegeId) {
        // 🚨 FIX: Use the dynamic ID passed from the controller
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new RuntimeException("College not found for the current Admin."));

        String defaultPassword = passwordEncoder.encode("AUWelcome123!");
        List<AppUser> usersToSave = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            br.readLine(); // Skip header row: RollNumber,Name,Email,Role

            while ((line = br.readLine()) != null) {
                String[] data = line.split(",");
                if (data.length < 4) continue;

                AppUser user = new AppUser();
                user.setRollNumber(data[0].trim());
                user.setName(data[1].trim());
                user.setEmail(data[2].trim());
                user.setRole(Role.valueOf(data[3].trim().toUpperCase()));
                user.setPassword(defaultPassword);
                user.setCollege(college);
                user.setActive(true);

                usersToSave.add(user);
            }

            // Batch save all users at once instead of hitting the DB in a loop
            userRepository.saveAll(usersToSave);

        } catch (Exception e) {
            throw new RuntimeException("Failed to process users CSV: " + e.getMessage());
        }
    }
}