package com.meeting.service;

import com.meeting.dto.user.ChangePasswordRequest;
import com.meeting.dto.user.UpdateProfileRequest;
import com.meeting.dto.user.UserProfileResponse;
import com.meeting.model.User;
import com.meeting.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;
    private UUID userId;
    private User testUser;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder);
        userId = UUID.randomUUID();
        testUser = new User("kanhaiya_p", "kanhaiya@example.com", "hash123", "Kanhaiya Pandey", "+91", "9876543210");
        testUser.setId(userId);
    }

    @Test
    @DisplayName("getProfile returns user profile response")
    void getProfile_Success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        UserProfileResponse response = userService.getProfile(userId);

        assertThat(response).isNotNull();
        assertThat(response.getUsername()).isEqualTo("kanhaiya_p");
        assertThat(response.getEmail()).isEqualTo("kanhaiya@example.com");
        assertThat(response.getFullName()).isEqualTo("Kanhaiya Pandey");
        assertThat(response.getCountryCode()).isEqualTo("+91");
        assertThat(response.getMobileNumber()).isEqualTo("9876543210");
    }

    @Test
    @DisplayName("updateProfile updates user information and saves")
    void updateProfile_Success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UpdateProfileRequest request = new UpdateProfileRequest("Kanhaiya Updated", "kanhaiya.new@example.com", "+1", "1234567890");
        when(userRepository.findByEmailIgnoreCase("kanhaiya.new@example.com")).thenReturn(Optional.empty());

        UserProfileResponse response = userService.updateProfile(userId, request);

        assertThat(response.getFullName()).isEqualTo("Kanhaiya Updated");
        assertThat(response.getEmail()).isEqualTo("kanhaiya.new@example.com");
        assertThat(response.getCountryCode()).isEqualTo("+1");
        assertThat(response.getMobileNumber()).isEqualTo("1234567890");
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("updateProfile updates username if valid and available")
    void updateProfile_UpdateUsername_Success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UpdateProfileRequest request = new UpdateProfileRequest("Kanhaiya Pandey", "kanhaiya@example.com", "+91", "9876543210", "new_kanhaiya");
        when(userRepository.findByUsernameIgnoreCase("new_kanhaiya")).thenReturn(Optional.empty());

        UserProfileResponse response = userService.updateProfile(userId, request);

        assertThat(response.getUsername()).isEqualTo("new_kanhaiya");
        assertThat(testUser.getUsername()).isEqualTo("new_kanhaiya");
    }

    @Test
    @DisplayName("updateProfile throws exception if new username is already taken by another user")
    void updateProfile_UsernameTaken_ThrowsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        User otherUser = new User("taken_name", "other@example.com", "hash", "Other User", "+91", "9000000000");
        otherUser.setId(UUID.randomUUID());

        when(userRepository.findByUsernameIgnoreCase("taken_name")).thenReturn(Optional.of(otherUser));

        UpdateProfileRequest request = new UpdateProfileRequest("Kanhaiya Pandey", "kanhaiya@example.com", "+91", "9876543210", "taken_name");

        assertThatThrownBy(() -> userService.updateProfile(userId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already taken");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateProfile throws exception if new email belongs to another user")
    void updateProfile_EmailInUseByOther_ThrowsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        User otherUser = new User("other_u", "other@example.com", "hash", "Other User", "+91", "9000000000");
        otherUser.setId(UUID.randomUUID());

        when(userRepository.findByEmailIgnoreCase("other@example.com")).thenReturn(Optional.of(otherUser));

        UpdateProfileRequest request = new UpdateProfileRequest("Kanhaiya Pandey", "other@example.com", "+91", "9876543210");

        assertThatThrownBy(() -> userService.updateProfile(userId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email address is already in use by another account");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("changePassword succeeds when current password matches")
    void changePassword_Success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("OldPass123!", "hash123")).thenReturn(true);
        when(passwordEncoder.matches("NewPass123!", "hash123")).thenReturn(false);
        when(passwordEncoder.encode("NewPass123!")).thenReturn("new_hash_456");

        ChangePasswordRequest request = new ChangePasswordRequest("OldPass123!", "NewPass123!");
        userService.changePassword(userId, request);

        assertThat(testUser.getPassword()).isEqualTo("new_hash_456");
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("changePassword throws BadCredentialsException when current password is wrong")
    void changePassword_WrongCurrentPassword_ThrowsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("WrongPass!", "hash123")).thenReturn(false);

        ChangePasswordRequest request = new ChangePasswordRequest("WrongPass!", "NewPass123!");

        assertThatThrownBy(() -> userService.changePassword(userId, request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Current password is incorrect");

        verify(userRepository, never()).save(any());
    }
}
