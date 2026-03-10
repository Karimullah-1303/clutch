package com.campus.identity.service;

import com.campus.identity.dto.ChangePasswordDto;
import com.campus.identity.entity.AppUser;
import com.campus.identity.entity.College;
import com.campus.identity.entity.enums.Role;
import com.campus.identity.repo.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * AuthService
 * Manages the core authentication lifecycles: Registration, Login, and Credential Updates.
 */
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final CollegeService collegeService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, CollegeService collegeService,
                       PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.collegeService = collegeService;
        this.passwordEncoder = passwordEncoder;
    }

    public AppUser register(String email, String password, Role role, UUID collegeId){
        if(userRepository.existsByEmail(email)){
            throw new RuntimeException("User with email: " + email + " already exists");
        }

        College college = collegeService.getCollegeById(collegeId);

        AppUser appUser = new AppUser();
        appUser.setEmail(email);
        appUser.setPassword(passwordEncoder.encode(password));
        appUser.setRole(role);
        appUser.setCollege(college);

        userRepository.save(appUser);

        return appUser;
    }

    /**
     * Verifies user credentials against the database hashes.
     * On success, returns the user entity which the controller will use to generate a JWT.
     */
    public AppUser login(String email, String password){
        AppUser user = userRepository.findByEmailAndIsActiveTrue(email).orElseThrow(()->new RuntimeException("Invalid Credentials"));

        if(!passwordEncoder.matches(password, user.getPassword())){
            throw new RuntimeException("Invalid Credentials");
        }

        return user;
    }

    /**
     * Securely updates a user's password, requiring verification of their existing password first.
     */
    @Transactional
    public void changePassword(String email, ChangePasswordDto request) {
        AppUser user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Cryptographic verification of the old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect old password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}