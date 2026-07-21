package com.prayertracker.patternviewer.api.auth;

public class UserProfileResponse {
    private final Long id;
    private final String fullName;
    private final String email;

    public UserProfileResponse(Long id, String fullName, String email) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }
}
