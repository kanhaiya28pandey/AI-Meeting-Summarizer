package com.meeting.service;

import com.meeting.dto.auth.AuthResponse;
import com.meeting.dto.auth.LoginRequest;
import com.meeting.dto.auth.SignupRequest;
import com.meeting.dto.user.UserProfileResponse;
import com.meeting.model.User;
import com.meeting.repository.UserRepository;
import com.meeting.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account with this email address already exists");
        }

        String chosenUsername;
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            String desired = request.getUsername().trim().toLowerCase(Locale.ROOT).replaceAll("^@", "");
            if (!desired.matches("^[a-zA-Z0-9_]{3,30}$")) {
                throw new IllegalArgumentException("Username must be between 3 and 30 alphanumeric characters or underscores");
            }
            if (userRepository.existsByUsernameIgnoreCase(desired)) {
                throw new IllegalArgumentException("Username @" + desired + " is already taken. Please choose another username.");
            }
            chosenUsername = desired;
        } else {
            chosenUsername = generateUniqueUsername(request.getFullName());
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(
                chosenUsername,
                email,
                encodedPassword,
                request.getFullName(),
                request.getCountryCode(),
                request.getMobileNumber()
        );

        User savedUser = userRepository.save(user);
        log.info("Registered new user id={} username={} email={}", savedUser.getId(), savedUser.getUsername(), savedUser.getEmail());

        String token = jwtService.generateToken(savedUser);

        return new AuthResponse(token, UserProfileResponse.fromEntity(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();

        User user = userRepository.findByEmailIgnoreCase(identifier)
                .or(() -> userRepository.findByUsernameIgnoreCase(identifier))
                .orElseThrow(() -> new BadCredentialsException("Invalid email/username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email/username or password");
        }

        String token = jwtService.generateToken(user);
        log.info("User logged in id={} username={}", user.getId(), user.getUsername());

        return new AuthResponse(token, UserProfileResponse.fromEntity(user));
    }

    /**
     * Generates a unique, friendly username from user's full name.
     * Example: "Kanhaiya Pandey" -> "kanhaiya_pandey" or "kanhaiya_pandey42"
     */
    public String generateUniqueUsername(String fullName) {
        String base = "";
        if (fullName != null) {
            base = Normalizer.normalize(fullName, Normalizer.Form.NFD)
                    .replaceAll("\\p{M}", "")
                    .toLowerCase(Locale.ROOT)
                    .replaceAll("[^a-z0-9]", "_")
                    .replaceAll("_+", "_")
                    .replaceAll("^_|_$", "");
        }

        if (base.length() < 3) {
            base = "user";
        }
        if (base.length() > 25) {
            base = base.substring(0, 25).replaceAll("_$", "");
        }

        if (!userRepository.existsByUsernameIgnoreCase(base)) {
            return base;
        }

        // Try appending numbers if collision
        Random random = ThreadLocalRandom.current();
        for (int i = 0; i < 50; i++) {
            int suffix = random.nextInt(10, 9999);
            String candidate = base + "_" + suffix;
            if (candidate.length() > 45) {
                candidate = candidate.substring(0, 45);
            }
            if (!userRepository.existsByUsernameIgnoreCase(candidate)) {
                return candidate;
            }
        }

        // Fallback with timestamp
        return base + "_" + (System.currentTimeMillis() % 100000);
    }
}
