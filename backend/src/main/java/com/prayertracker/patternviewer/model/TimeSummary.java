package com.prayertracker.patternviewer.model;

public class TimeSummary {
    private final long obligatoryMinutes;
    private final long specialMinutes;
    private final long totalMinutes;

    public TimeSummary(long obligatoryMinutes, long specialMinutes) {
        this.obligatoryMinutes = obligatoryMinutes;
        this.specialMinutes = specialMinutes;
        this.totalMinutes = obligatoryMinutes + specialMinutes;
    }

    public long getObligatoryMinutes() {
        return obligatoryMinutes;
    }

    public long getSpecialMinutes() {
        return specialMinutes;
    }

    public long getTotalMinutes() {
        return totalMinutes;
    }

    public double getTotalHours() {
        return Math.round((totalMinutes / 60.0) * 10.0) / 10.0;
    }

    public double getTotalDays() {
        return Math.round((totalMinutes / 1440.0) * 100.0) / 100.0;
    }
}
