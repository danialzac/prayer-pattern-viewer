package com.prayertracker.patternviewer.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "prayer_record")
public class PrayerRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false)
    private int birthYear;

    @Column(nullable = false)
    private int startAge;

    @Column(nullable = false)
    private double consistencyRate;

    @Column(nullable = false)
    private boolean includeFriday;

    @Column(nullable = false)
    private boolean includeTarawih;

    @Column(nullable = false)
    private boolean includeEidPrayers;

    @Column(nullable = false)
    private long totalObligatoryPrayers;

    @Column(nullable = false)
    private long performedPrayers;

    @Column(nullable = false)
    private long totalMinutes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public int getBirthYear() {
        return birthYear;
    }

    public void setBirthYear(int birthYear) {
        this.birthYear = birthYear;
    }

    public int getStartAge() {
        return startAge;
    }

    public void setStartAge(int startAge) {
        this.startAge = startAge;
    }

    public double getConsistencyRate() {
        return consistencyRate;
    }

    public void setConsistencyRate(double consistencyRate) {
        this.consistencyRate = consistencyRate;
    }

    public boolean isIncludeFriday() {
        return includeFriday;
    }

    public void setIncludeFriday(boolean includeFriday) {
        this.includeFriday = includeFriday;
    }

    public boolean isIncludeTarawih() {
        return includeTarawih;
    }

    public void setIncludeTarawih(boolean includeTarawih) {
        this.includeTarawih = includeTarawih;
    }

    public boolean isIncludeEidPrayers() {
        return includeEidPrayers;
    }

    public void setIncludeEidPrayers(boolean includeEidPrayers) {
        this.includeEidPrayers = includeEidPrayers;
    }

    public long getTotalObligatoryPrayers() {
        return totalObligatoryPrayers;
    }

    public void setTotalObligatoryPrayers(long totalObligatoryPrayers) {
        this.totalObligatoryPrayers = totalObligatoryPrayers;
    }

    public long getPerformedPrayers() {
        return performedPrayers;
    }

    public void setPerformedPrayers(long performedPrayers) {
        this.performedPrayers = performedPrayers;
    }

    public long getTotalMinutes() {
        return totalMinutes;
    }

    public void setTotalMinutes(long totalMinutes) {
        this.totalMinutes = totalMinutes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
