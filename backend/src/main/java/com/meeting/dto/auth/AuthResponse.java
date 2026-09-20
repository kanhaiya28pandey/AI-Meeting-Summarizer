package com.meeting.dto.auth;

import com.meeting.dto.user.UserProfileResponse;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private UserProfileResponse user;

    public AuthResponse() {
    }

    public AuthResponse(String token, UserProfileResponse user) {
        this.token = token;
        this.tokenType = "Bearer";
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public UserProfileResponse getUser() {
        return user;
    }

    public void setUser(UserProfileResponse user) {
        this.user = user;
    }
}
