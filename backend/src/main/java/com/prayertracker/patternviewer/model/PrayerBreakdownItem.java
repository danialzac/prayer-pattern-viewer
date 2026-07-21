package com.prayertracker.patternviewer.model;

public class PrayerBreakdownItem {
    private final String name;
    private final String description;
    private final int rakaatsPerPrayer;
    private final long totalOccurrences;
    private final long estimatedPerformed;
    private final long totalRakaats;
    private final double consistencyRate;

    public PrayerBreakdownItem(
            String name,
            String description,
            int rakaatsPerPrayer,
            long totalOccurrences,
            long estimatedPerformed,
            long totalRakaats,
            double consistencyRate
    ) {
        this.name = name;
        this.description = description;
        this.rakaatsPerPrayer = rakaatsPerPrayer;
        this.totalOccurrences = totalOccurrences;
        this.estimatedPerformed = estimatedPerformed;
        this.totalRakaats = totalRakaats;
        this.consistencyRate = consistencyRate;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public int getRakaatsPerPrayer() {
        return rakaatsPerPrayer;
    }

    public long getTotalOccurrences() {
        return totalOccurrences;
    }

    public long getEstimatedPerformed() {
        return estimatedPerformed;
    }

    public long getTotalRakaats() {
        return totalRakaats;
    }

    public double getConsistencyRate() {
        return consistencyRate;
    }
}
