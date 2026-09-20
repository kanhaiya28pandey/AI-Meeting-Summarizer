package com.meeting.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @NotBlank(message = "Full name cannot be blank")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @Pattern(regexp = "^\\+[1-9]\\d{0,3}$", message = "Country code must start with + followed by 1 to 4 digits")
    private String countryCode = "+91";

    @NotBlank(message = "Mobile number cannot be blank")
    @Pattern(regexp = "^\\d{10}$", message = "Mobile number must be exactly 10 digits")
    private String mobileNumber;

    @Pattern(regexp = "^$|^[a-zA-Z0-9_]{3,30}$", message = "Username must be between 3 and 30 alphanumeric characters or underscores")
    private String username;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String fullName, String email, String countryCode, String mobileNumber) {
        this.fullName = fullName;
        this.email = email;
        this.countryCode = countryCode != null && !countryCode.isBlank() ? countryCode : "+91";
        this.mobileNumber = mobileNumber;
    }

    public UpdateProfileRequest(String fullName, String email, String countryCode, String mobileNumber, String username) {
        this(fullName, email, countryCode, mobileNumber);
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
}
