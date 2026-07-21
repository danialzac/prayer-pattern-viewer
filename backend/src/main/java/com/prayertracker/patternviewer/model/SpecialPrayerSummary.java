package com.prayertracker.patternviewer.model;

import java.util.List;

public class SpecialPrayerSummary {
    private final long totalOccurrences;
    private final long totalMinutes;
    private final List<SpecialPrayerEstimate> items;

    public SpecialPrayerSummary(long totalOccurrences, long totalMinutes, List<SpecialPrayerEstimate> items) {
        this.totalOccurrences = totalOccurrences;
        this.totalMinutes = totalMinutes;
        this.items = items;
    }

    public long getTotalOccurrences() {
        return totalOccurrences;
    }

    public long getTotalMinutes() {
        return totalMinutes;
    }

    public double getTotalHours() {
        return Math.round((totalMinutes / 60.0) * 10.0) / 10.0;
    }

    public List<SpecialPrayerEstimate> getItems() {
        return items;
    }
}
