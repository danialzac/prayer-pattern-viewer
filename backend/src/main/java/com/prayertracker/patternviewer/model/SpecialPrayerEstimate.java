package com.prayertracker.patternviewer.model;

public class SpecialPrayerEstimate {
    private final String name;
    private final String description;
    private final long estimatedOccurrences;
    private final int rakaatsPerOccurrence;
    private final long totalRakaats;
    private final long totalMinutes;

    public SpecialPrayerEstimate(
            String name,
            String description,
            long estimatedOccurrences,
            int rakaatsPerOccurrence,
            long totalRakaats,
            long totalMinutes
    ) {
        this.name = name;
        this.description = description;
        this.estimatedOccurrences = estimatedOccurrences;
        this.rakaatsPerOccurrence = rakaatsPerOccurrence;
        this.totalRakaats = totalRakaats;
        this.totalMinutes = totalMinutes;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public long getEstimatedOccurrences() {
        return estimatedOccurrences;
    }

    public int getRakaatsPerOccurrence() {
        return rakaatsPerOccurrence;
    }

    public long getTotalRakaats() {
        return totalRakaats;
    }

    public long getTotalMinutes() {
        return totalMinutes;
    }

    public double getTotalHours() {
        return Math.round((totalMinutes / 60.0) * 10.0) / 10.0;
    }
}
