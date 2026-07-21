package com.prayertracker.patternviewer.model;

import java.util.List;

public class PrayerStats {
    private final int currentYear;
    private final int startYear;
    private final long yearsSinceStart;
    private final long daysSinceStart;
    private final long totalObligatoryPrayers;
    private final long totalObligatoryRakaats;
    private final PracticeEstimate practice;
    private final TimeSummary time;
    private final List<PrayerBreakdownItem> obligatoryBreakdown;
    private final SpecialPrayerSummary specialPrayers;
    private final List<String> assumptions;

    public PrayerStats(
            int currentYear,
            int startYear,
            long yearsSinceStart,
            long daysSinceStart,
            long totalObligatoryPrayers,
            long totalObligatoryRakaats,
            PracticeEstimate practice,
            TimeSummary time,
            List<PrayerBreakdownItem> obligatoryBreakdown,
            SpecialPrayerSummary specialPrayers,
            List<String> assumptions
    ) {
        this.currentYear = currentYear;
        this.startYear = startYear;
        this.yearsSinceStart = yearsSinceStart;
        this.daysSinceStart = daysSinceStart;
        this.totalObligatoryPrayers = totalObligatoryPrayers;
        this.totalObligatoryRakaats = totalObligatoryRakaats;
        this.practice = practice;
        this.time = time;
        this.obligatoryBreakdown = obligatoryBreakdown;
        this.specialPrayers = specialPrayers;
        this.assumptions = assumptions;
    }

    public int getCurrentYear() {
        return currentYear;
    }

    public int getStartYear() {
        return startYear;
    }

    public long getYearsSinceStart() {
        return yearsSinceStart;
    }

    public long getDaysSinceStart() {
        return daysSinceStart;
    }

    public long getTotalObligatoryPrayers() {
        return totalObligatoryPrayers;
    }

    public long getTotalObligatoryRakaats() {
        return totalObligatoryRakaats;
    }

    public PracticeEstimate getPractice() {
        return practice;
    }

    public TimeSummary getTime() {
        return time;
    }

    public List<PrayerBreakdownItem> getObligatoryBreakdown() {
        return obligatoryBreakdown;
    }

    public SpecialPrayerSummary getSpecialPrayers() {
        return specialPrayers;
    }

    public List<String> getAssumptions() {
        return assumptions;
    }
}
