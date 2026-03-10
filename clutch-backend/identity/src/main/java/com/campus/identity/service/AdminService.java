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

    // Hardcoded authoritative ID for Andhra University.
    private final UUID ANDHRA_UNIV_ID = UUID.fromString("bb12e7cf-b357-407d-a417-c43d014758e7");

    /**
     * Parses a CSV file to bulk-create user accounts (Students, Teachers, Admins).
     * Applies a default password hash and associates them with the university tenant.
     */
    @Transactional
    public void processUsersCsv(MultipartFile file) {
        College college = collegeRepository.findById(ANDHRA_UNIV_ID).orElseThrow();

        // Hash the default password once to save CPU cycles during the loop
        String defaultPassword = passwordEncoder.encode("AUWelcome123!");

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

                // Saves the pure identity record.
                // Academic enrollments are handled separately by the Academy Service.
                userRepository.save(user);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to process users CSV: " + e.getMessage());
        }
    }
}