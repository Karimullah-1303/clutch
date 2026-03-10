package com.campus.identity.service;

import com.campus.identity.dto.UserProfileDto;
import com.campus.identity.dto.UserUpdateDto;
import com.campus.identity.entity.AppUser;
import com.campus.identity.repo.UserRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * UserService
 * Manages standard user profile operations and safe data retrieval.
 */
@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AppUser getUserById(UUID ID){
        return userRepository.findById(ID).orElseThrow(()->new RuntimeException("User not found."));
    }

    public AppUser getUserByEmail(String email){
        return userRepository.findByEmailAndIsActiveTrue(email).orElseThrow(()->new RuntimeException("User not found with email: " + email));
    }

    /**
     * Constructs a safe, password-free Data Transfer Object (DTO) for external consumption
     * (e.g., returning profile details to the React frontend or hydrating Academy Service requests).
     */
    public UserProfileDto getProfileByEmail(String email) {
        AppUser user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserProfileDto.builder()
                .id(user.getId())
                .rollNumber(user.getRollNumber())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .collegeName(user.getCollege().getName())
                .build();
    }

    public void updateProfile(String email, UserUpdateDto updateDto) {
        AppUser user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(updateDto.getName());
        userRepository.save(user);
    }

    /**
     * Implements a Soft Delete pattern.
     * Instead of dropping the database row (which breaks foreign keys in other microservices),
     * we simply mark the user as inactive.
     */
    public void softDeleteUser(UUID ID){
        AppUser user = userRepository.findById(ID)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }
}