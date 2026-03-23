package com.campus.identity.config;

import com.campus.identity.entity.AppUser;
import com.campus.identity.entity.College;
import com.campus.identity.entity.enums.Role;
import com.campus.identity.repo.CollegeRepository;
import com.campus.identity.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final CollegeRepository collegeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@andhrauniversity.edu.in";

        try {
            // 1. SAFELY GET OR CREATE COLLEGE (Let Hibernate handle the ID)
            College college;
            List<College> existingColleges = collegeRepository.findAll();

            if (existingColleges.isEmpty()) {
                College newCollege = new College();
                newCollege.setName("Andhra University");
                newCollege.setDomain("andhrauniversity.edu.in");
                college = collegeRepository.save(newCollege);
                log.info("✅ [SEEDER] Created new College with auto-generated ID.");
            } else {
                college = existingColleges.get(0);
                log.info("ℹ️ [SEEDER] College already present.");
            }

            // 2. CREATE MASTER ADMIN
            if (userRepository.findByEmailAndIsActiveTrue(adminEmail).isEmpty()) {
                AppUser admin = new AppUser();
                admin.setCollege(college); // Uses the safely fetched/created college
                admin.setName("Master Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("password"));
                admin.setRole(Role.ADMIN);
                admin.setActive(true);

                userRepository.save(admin);
                log.info("✅ [SEEDER] Master Admin created successfully: {}", adminEmail);
            } else {
                log.info("ℹ️ [SEEDER] Master Admin already present.");
            }

        } catch (Exception e) {
            log.error("❌ [SEEDER] Critical error during database seeding: ", e);
        }
    }
}