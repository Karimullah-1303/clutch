package com.campus.academyservice.client;

import com.campus.academyservice.dto.UserProfileDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * OpenFeign Client Interface
 * Acts as a proxy to execute synchronous HTTP calls to the Identity Service (Port 8081).
 * Abstracts away the complexity of RestTemplate and handles data hydration across microservice boundaries.
 */
@FeignClient(name =  "identity-service", url = "${IDENTITY_SERVICE_URL}")
public interface IdentityServiceClient {

    /**
     * Interrogates the Identity Service to validate a JWT and return the authoritative user profile.
     * Used heavily in AttendanceService to prevent unauthorized access (e.g., verifying a Teacher role).
     */
    @GetMapping("/api/v1/users/me")
    UserProfileDto validateTokenAndGetUser(@RequestHeader("Authorization") String token);

    /**
     * Batch retrieves full user profiles (names, roll numbers) based on a list of UUIDs.
     * Used to hydrate the At-Risk student list and the class roster UI.
     */

    @PostMapping("/api/v1/users/batch")
    List<UserProfileDto> getUsersByIds(@RequestHeader("Authorization") String token, @RequestBody List<UUID> userIds);

    @PostMapping("/api/v1/users/batch-names")
    Map<UUID, String> getTeacherNames(@RequestHeader("Authorization") String token, @RequestBody Set<UUID> teacherIds);
}