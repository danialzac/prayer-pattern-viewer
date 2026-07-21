package com.prayertracker.patternviewer.api;

import java.time.LocalDateTime;

public class PrayerHistoryItem {
    private final Long id;
    private final int birthYear;
    private final int startAge;
    private final double consistencyRate;
    private final boolean includeFriday;
    private final boolean includeTarawih;
    private final boolean includeEidPrayers;
    private final long totalObligatoryPrayers;
    private final long performedPrayers;
    private final long totalMinutes;
    private final LocalDateTime createdAt;

    public PrayerHistoryItem(
            Long id,
            int birthYear,
            int startAge,
            double consistencyRate,
            boolean includeFriday,
            boolean includeTarawih,
            boolean includeEidPrayers,
            long totalObligatoryPrayers,
            long performedPrayers,
            long totalMinutes,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.birthYear = birthYear;
        this.startAge = startAge;
        this.consistencyRate = consistencyRate;
        this.includeFriday = includeFriday;
        this.includeTarawih = includeTarawih;
        this.includeEidPrayers = includeEidPrayers;
        this.totalObligatoryPrayers = totalObligatoryPrayers;
        this.performedPrayers = performedPrayers;
        this.totalMinutes = totalMinutes;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public int getBirthYear() {
        return birthYear;
    }

    public int getStartAge() {
        return startAge;
    }

    public double getConsistencyRate() {
        return consistencyRate;
    }

    public boolean isIncludeFriday() {
        return includeFriday;
    }

    public boolean isIncludeTarawih() {
        return includeTarawih;
    }

    public boolean isIncludeEidPrayers() {
        return includeEidPrayers;
    }

    public long getTotalObligatoryPrayers() {
        return totalObligatoryPrayers;
    }

    public long getPerformedPrayers() {
        return performedPrayers;
    }

    public long getTotalMinutes() {
        return totalMinutes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
