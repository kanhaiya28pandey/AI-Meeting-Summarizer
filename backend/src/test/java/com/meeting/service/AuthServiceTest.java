package com.meeting.service;

import com.meeting.dto.auth.AuthResponse;
import com.meeting.dto.auth.LoginRequest;
import com.meeting.dto.auth.SignupRequest;
import com.meeting.model.User;
import com.meeting.repository.UserRepository;
import com.meeting.security.JwtService;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    @Test
    @DisplayName("signup generates unique username, hashes password, saves user and returns token")
    void signup_Success() {
        SignupRequest request = new SignupRequest("Kanhaiya Pandey", "kanhaiya@example.com", "+91", "9876543210", "Password123!");

        when(userRepository.existsByEmailIgnoreCase("kanhaiya@example.com")).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("kanhaiya_pandey")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("encoded_pass");

        User mockUser = new User("kanhaiya_pandey", "kanhaiya@example.com", "encoded_pass", "Kanhaiya Pandey", "+91", "9876543210");
        UUID userId = UUID.randomUUID();
        mockUser.setId(userId);

        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(jwtService.generateToken(mockUser)).thenReturn("jwt.token.mock");

        AuthResponse response = authService.signup(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt.token.mock");
        assertThat(response.getUser()).isNotNull();
        assertThat(response.getUser().getUsername()).isEqualTo("kanhaiya_pandey");
        assertThat(response.getUser().getEmail()).isEqualTo("kanhaiya@example.com");
    }

    @Test
    @DisplayName("signup accepts valid custom username and does not auto-generate")
    void signup_WithCustomUsername_Success() {
        SignupRequest request = new SignupRequest("Custom Person", "custom@example.com", "+1", "1234567890", "Password123!", "my_handle");

        when(userRepository.existsByEmailIgnoreCase("custom@example.com")).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("my_handle")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("encoded_pass");

        User mockUser = new User("my_handle", "custom@example.com", "encoded_pass", "Custom Person", "+1", "1234567890");
        mockUser.setId(UUID.randomUUID());

        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(jwtService.generateToken(mockUser)).thenReturn("jwt.token.custom");

        AuthResponse response = authService.signup(request);

        assertThat(response).isNotNull();
        assertThat(response.getUser().getUsername()).isEqualTo("my_handle");
    }

    @Test
    @DisplayName("signup throws IllegalArgumentException if custom username is already taken")
    void signup_CustomUsernameTaken_ThrowsException() {
        SignupRequest request = new SignupRequest("Custom Person", "custom2@example.com", "+1", "1234567890", "Password123!", "taken_user");

        when(userRepository.existsByEmailIgnoreCase("custom2@example.com")).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("taken_user")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already taken");
    }

    @Test
    @DisplayName("signup throws IllegalArgumentException if email already registered")
    void signup_DuplicateEmail_ThrowsException() {
        SignupRequest request = new SignupRequest("Jane Doe", "jane@example.com", "+1", "1234567890", "Password123!");
        when(userRepository.existsByEmailIgnoreCase("jane@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("An account with this email address already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("login succeeds with email identifier")
    void login_WithEmail_Success() {
        LoginRequest request = new LoginRequest("test@example.com", "SecretPass1!");
        User user = new User("test_user", "test@example.com", "encoded_hash", "Test User", "+91", "9999988888");
        user.setId(UUID.randomUUID());

        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("SecretPass1!", "encoded_hash")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("jwt.token.email");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("jwt.token.email");
        assertThat(response.getUser().getUsername()).isEqualTo("test_user");
    }

    @Test
    @DisplayName("login succeeds with username identifier")
    void login_WithUsername_Success() {
        LoginRequest request = new LoginRequest("test_user", "SecretPass1!");
        User user = new User("test_user", "test@example.com", "encoded_hash", "Test User", "+91", "9999988888");
        user.setId(UUID.randomUUID());

        when(userRepository.findByEmailIgnoreCase("test_user")).thenReturn(Optional.empty());
        when(userRepository.findByUsernameIgnoreCase("test_user")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("SecretPass1!", "encoded_hash")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("jwt.token.username");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("jwt.token.username");
        assertThat(response.getUser().getUsername()).isEqualTo("test_user");
    }

    @Test
    @DisplayName("login throws BadCredentialsException when password does not match")
    void login_WrongPassword_ThrowsException() {
        LoginRequest request = new LoginRequest("test_user", "WrongPass!");
        User user = new User("test_user", "test@example.com", "encoded_hash", "Test User", "+91", "9999988888");

        when(userRepository.findByEmailIgnoreCase("test_user")).thenReturn(Optional.empty());
        when(userRepository.findByUsernameIgnoreCase("test_user")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPass!", "encoded_hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid email/username or password");
    }

    @Test
    @DisplayName("generateUniqueUsername handles collisions by appending numbers")
    void generateUniqueUsername_HandlesCollision() {
        when(userRepository.existsByUsernameIgnoreCase("john_doe")).thenReturn(true);
        when(userRepository.existsByUsernameIgnoreCase(startsWith("john_doe_"))).thenReturn(false);

        String username = authService.generateUniqueUsername("John Doe");

        assertThat(username).startsWith("john_doe_");
        assertThat(username.length()).isGreaterThan("john_doe_".length());
    }
}
