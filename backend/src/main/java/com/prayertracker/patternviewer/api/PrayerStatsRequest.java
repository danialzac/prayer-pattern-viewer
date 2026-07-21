package com.prayertracker.patternviewer.api;

public class PrayerStatsRequest {
    public int birthYear;
    public int startAge;
    public double consistencyRate;
    public boolean useCustomPrayerRates;
    public Double fajrRate;
    public Double dhuhrRate;
    public Double asrRate;
    public Double maghribRate;
    public Double ishaRate;
    public boolean includeFriday;
    public boolean includeTarawih = true;
    public boolean includeEidPrayers = true;
}
