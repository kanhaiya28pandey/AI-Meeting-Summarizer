package com.meeting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meeting.dto.auth.LoginRequest;
import com.meeting.dto.auth.SignupRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/signup registers a user, auto-generates username, and returns JWT")
    void signup_EndToEnd_Success() throws Exception {
        SignupRequest signupRequest = new SignupRequest(
                "Ananya Sharma",
                "ananya.sharma" + System.currentTimeMillis() + "@example.com",
                "+91",
                "9876543210",
                "SecurePassword123!"
        );

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.user.username", startsWith("ananya_sharma")))
                .andExpect(jsonPath("$.user.fullName", is("Ananya Sharma")))
                .andExpect(jsonPath("$.user.email", is(signupRequest.getEmail().toLowerCase())))
                .andExpect(jsonPath("$.user.countryCode", is("+91")))
                .andExpect(jsonPath("$.user.mobileNumber", is("9876543210")));
    }

    @Test
    @DisplayName("Dual login works with both email and auto-generated username")
    void login_DualIdentifier_Success() throws Exception {
        String uniqueSuffix = String.valueOf(System.currentTimeMillis() % 10000);
        String email = "rahul" + uniqueSuffix + "@example.com";
        String password = "Password456!";

        SignupRequest signupRequest = new SignupRequest("Rahul Verma", email, "+91", "9123456789", password);

        String signupResult = mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String generatedUsername = objectMapper.readTree(signupResult).get("user").get("username").asText();

        // 1. Login with email
        LoginRequest loginWithEmail = new LoginRequest(email, password);
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginWithEmail)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.username", is(generatedUsername)));

        // 2. Login with username
        LoginRequest loginWithUsername = new LoginRequest(generatedUsername, password);
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginWithUsername)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.email", is(email)));
    }

    @Test
    @DisplayName("POST /api/auth/login fails with 401 for incorrect password")
    void login_InvalidPassword_Fails() throws Exception {
        LoginRequest badRequest = new LoginRequest("nonexistent@example.com", "WrongPassword123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isUnauthorized());
    }
}
