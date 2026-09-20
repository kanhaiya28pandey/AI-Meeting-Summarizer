package com.meeting.service;

import com.meeting.dto.user.ChangePasswordRequest;
import com.meeting.dto.user.UpdateProfileRequest;
import com.meeting.dto.user.UserProfileResponse;
import com.meeting.model.User;
import com.meeting.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return UserProfileResponse.fromEntity(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        String newEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (!newEmail.equalsIgnoreCase(user.getEmail())) {
            userRepository.findByEmailIgnoreCase(newEmail).ifPresent(existing -> {
                if (!existing.getId().equals(userId)) {
                    throw new IllegalArgumentException("Email address is already in use by another account");
                }
            });
            user.setEmail(newEmail);
        }

        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            String newUsername = request.getUsername().trim().toLowerCase(Locale.ROOT).replaceAll("^@", "");
            if (!newUsername.matches("^[a-zA-Z0-9_]{3,30}$")) {
                throw new IllegalArgumentException("Username must be between 3 and 30 alphanumeric characters or underscores");
            }
            if (!newUsername.equalsIgnoreCase(user.getUsername())) {
                userRepository.findByUsernameIgnoreCase(newUsername).ifPresent(existing -> {
                    if (!existing.getId().equals(userId)) {
                        throw new IllegalArgumentException("Username @" + newUsername + " is already taken by another user");
                    }
                });
                user.setUsername(newUsername);
            }
        }

        user.setFullName(request.getFullName().trim());
        user.setCountryCode(request.getCountryCode());
        user.setMobileNumber(request.getMobileNumber().trim());

        User updatedUser = userRepository.save(user);
        log.info("Profile updated for user id={} username={}", updatedUser.getId(), updatedUser.getUsername());

        return UserProfileResponse.fromEntity(updatedUser);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password cannot be the same as the current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password successfully updated for user id={}", userId);
    }
}
