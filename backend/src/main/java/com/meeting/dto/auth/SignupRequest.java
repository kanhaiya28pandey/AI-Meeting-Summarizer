package com.meeting.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SignupRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @Pattern(regexp = "^\\+[1-9]\\d{0,3}$", message = "Country code must start with + followed by 1 to 4 digits")
    private String countryCode = "+91";

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Mobile number must be exactly 10 digits")
    private String mobileNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters long")
    private String password;

    @Pattern(regexp = "^$|^[a-zA-Z0-9_]{3,30}$", message = "Username must be between 3 and 30 alphanumeric characters or underscores")
    private String username;

    public SignupRequest() {
    }

    public SignupRequest(String fullName, String email, String countryCode, String mobileNumber, String password) {
        this.fullName = fullName;
        this.email = email;
        this.countryCode = countryCode != null && !countryCode.isBlank() ? countryCode : "+91";
        this.mobileNumber = mobileNumber;
        this.password = password;
    }

    public SignupRequest(String fullName, String email, String countryCode, String mobileNumber, String password, String username) {
        this(fullName, email, countryCode, mobileNumber, password);
        this.username = username;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
