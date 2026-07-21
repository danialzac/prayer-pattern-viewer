package com.prayertracker.patternviewer.service;

import com.prayertracker.patternviewer.api.PrayerStatsRequest;
import com.prayertracker.patternviewer.assumptions.PrayerAssumptions;
import com.prayertracker.patternviewer.model.DailyPrayer;
import com.prayertracker.patternviewer.model.PracticeEstimate;
import com.prayertracker.patternviewer.model.PrayerBreakdownItem;
import com.prayertracker.patternviewer.model.PrayerStats;
import com.prayertracker.patternviewer.model.SpecialPrayerEstimate;
import com.prayertracker.patternviewer.model.SpecialPrayerSummary;
import com.prayertracker.patternviewer.model.TimeSummary;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class PrayerCalculator {

    public PrayerStats calculatePrayerStats(PrayerStatsRequest request) {
        //! Main calculator flow: turn one request into one full prayer summary for the frontend.
        //! Flow kiraan utama: tukar satu request jadi satu summary solat penuh untuk frontend.
        int currentYear = LocalDate.now().getYear();
        int startYear = request.birthYear + request.startAge;
        long yearsSinceStart = Math.max(currentYear - startYear, 0);
        long daysSinceStart = Math.max(Math.round(yearsSinceStart * PrayerAssumptions.DAYS_PER_YEAR), 0);
        long totalObligatoryPrayers = daysSinceStart * PrayerAssumptions.DAILY_PRAYERS;
        long totalObligatoryRakaats = daysSinceStart * PrayerAssumptions.DAILY_RAKAATS;

        List<PrayerBreakdownItem> breakdown = buildObligatoryBreakdown(daysSinceStart, request);
        long performedPrayers = breakdown.stream().mapToLong(PrayerBreakdownItem::getEstimatedPerformed).sum();
        double effectiveConsistencyRate = totalObligatoryPrayers == 0
                ? 0.0
                : (double) performedPrayers / totalObligatoryPrayers;
        PracticeEstimate practice = new PracticeEstimate(
                performedPrayers,
                totalObligatoryPrayers - performedPrayers,
                effectiveConsistencyRate
        );
        SpecialPrayerSummary specialPrayerSummary = buildSpecialPrayerSummary(
                yearsSinceStart,
                daysSinceStart,
                request.includeFriday,
                request.includeTarawih,
                request.includeEidPrayers
        );
        long obligatoryMinutes = estimateObligatoryMinutes(practice.getPerformed(), daysSinceStart, request.includeFriday);
        TimeSummary time = new TimeSummary(obligatoryMinutes, specialPrayerSummary.getTotalMinutes());

        return new PrayerStats(
                currentYear,
                startYear,
                yearsSinceStart,
                daysSinceStart,
                totalObligatoryPrayers,
                totalObligatoryRakaats,
                practice,
                time,
                breakdown,
                specialPrayerSummary,
                buildAssumptions(request.includeFriday, request.includeTarawih, request.includeEidPrayers)
        );
    }

    private double clampRate(double rate) {
        //WARN Keep the rate between 0 and 1 so strange input does not break the math.
        //WARN Paksa rate antara 0 dan 1 supaya input pelik tak rosakkan kiraan.
        return Math.max(0.0, Math.min(rate, 1.0));
    }

    public PracticeEstimate estimatePractice(long total, double rate) {
        //? Input: total prayers and a consistency rate. Output: performed vs remaining estimate.
        //? Input: jumlah solat dan rate consistency. Output: anggaran siap vs yang belum konsisten.
        long performed = Math.round(total * rate);
        return new PracticeEstimate(performed, total - performed, rate);
    }

    public long estimateObligatoryMinutes(long prayersPerformed, long daysSinceStart, boolean includeFriday) {
        //? This estimates time spent, not spiritual reward.
        //? Ni anggar masa yang dihabiskan, bukan ganjaran spiritual.
        long minutes = prayersPerformed * PrayerAssumptions.MINUTES_PER_PRAYER;
        if (includeFriday) {
            minutes += (daysSinceStart / 7) * PrayerAssumptions.FRIDAY_PRAYER_MINUTES;
        }
        return minutes;
    }

    private List<PrayerBreakdownItem> buildObligatoryBreakdown(long daysSinceStart, PrayerStatsRequest request) {
        //? Build one breakdown row per obligatory prayer so the UI can show each prayer separately.
        //? Bina satu row breakdown untuk setiap solat wajib supaya UI boleh tunjuk ikut jenis.
        return Arrays.stream(DailyPrayer.values())
                .map(prayer -> {
                    double prayerRate = resolvePrayerRate(request, prayer);
                    return new PrayerBreakdownItem(
                            prayer.name(),
                            prayer.getDescription(),
                            prayer.getRakaats(),
                            daysSinceStart,
                            Math.round(daysSinceStart * prayerRate),
                            daysSinceStart * prayer.getRakaats(),
                            prayerRate
                    );
                })
                .toList();
    }

    private double resolvePrayerRate(PrayerStatsRequest request, DailyPrayer prayer) {
        double defaultRate = clampRate(request.consistencyRate);
        if (!request.useCustomPrayerRates) {
            return defaultRate;
        }

        return switch (prayer) {
            case SUBUH -> clampNullableRate(request.fajrRate, defaultRate);
            case ZUHR -> clampNullableRate(request.dhuhrRate, defaultRate);
            case ASR -> clampNullableRate(request.asrRate, defaultRate);
            case MAGHRIB -> clampNullableRate(request.maghribRate, defaultRate);
            case ISHA -> clampNullableRate(request.ishaRate, defaultRate);
        };
    }

    private double clampNullableRate(Double rate, double fallbackRate) {
        return rate == null ? fallbackRate : clampRate(rate);
    }

    private SpecialPrayerSummary buildSpecialPrayerSummary(
            long yearsSinceStart,
            long daysSinceStart,
            boolean includeFriday,
            boolean includeTarawih,
            boolean includeEidPrayers
    ) {
        //! This section handles special prayer opportunities like Jumu'ah, Tarawih, and Eid.
        //! Part ni handle peluang solat khas macam Jumaat, Tarawih, dan Hari Raya.
        List<SpecialPrayerEstimate> items = new ArrayList<>();

        if (includeFriday) {
            long fridayCount = daysSinceStart / 7;
            items.add(new SpecialPrayerEstimate(
                    "Jumu'ah",
                    "Estimated weekly Friday congregational prayers.",
                    fridayCount,
                    2,
                    fridayCount * 2,
                    fridayCount * PrayerAssumptions.FRIDAY_PRAYER_MINUTES
            ));
        }

        if (includeTarawih) {
            long tarawihCount = yearsSinceStart * PrayerAssumptions.TARAWIH_NIGHTS_PER_RAMADAN;
            items.add(new SpecialPrayerEstimate(
                    "Tarawih",
                    "Estimated Ramadan night prayers using 29 nights each year.",
                    tarawihCount,
                    PrayerAssumptions.TARAWIH_RAKAATS,
                    tarawihCount * PrayerAssumptions.TARAWIH_RAKAATS,
                    tarawihCount * PrayerAssumptions.TARAWIH_MINUTES
            ));
        }

        if (includeEidPrayers) {
            items.add(new SpecialPrayerEstimate(
                    "Eid al-Fitr",
                    "One Eid prayer each Ramadan completion.",
                    yearsSinceStart,
                    PrayerAssumptions.EID_PRAYER_RAKAATS,
                    yearsSinceStart * PrayerAssumptions.EID_PRAYER_RAKAATS,
                    yearsSinceStart * PrayerAssumptions.EID_PRAYER_MINUTES
            ));
            items.add(new SpecialPrayerEstimate(
                    "Eid al-Adha",
                    "One Eid prayer each year during Dhul Hijjah.",
                    yearsSinceStart,
                    PrayerAssumptions.EID_PRAYER_RAKAATS,
                    yearsSinceStart * PrayerAssumptions.EID_PRAYER_RAKAATS,
                    yearsSinceStart * PrayerAssumptions.EID_PRAYER_MINUTES
            ));
        }

        long totalOccurrences = items.stream().mapToLong(SpecialPrayerEstimate::getEstimatedOccurrences).sum();
        long totalMinutes = items.stream().mapToLong(SpecialPrayerEstimate::getTotalMinutes).sum();
        return new SpecialPrayerSummary(totalOccurrences, totalMinutes, items);
    }

    private List<String> buildAssumptions(boolean includeFriday, boolean includeTarawih, boolean includeEidPrayers) {
        //NOTE These notes explain the shortcuts used so the estimate feels transparent, not magical.
        //NOTE Nota ni explain shortcut yang dipakai supaya anggaran ni nampak jelas, bukan macam magic.
        List<String> assumptions = new ArrayList<>();
        assumptions.add("Start year is estimated as birth year plus the age when prayer practice began.");
        assumptions.add("Day totals use 365.25 days per year because the exact birth date is not provided.");
        assumptions.add("Daily prayer time uses an average of 6 minutes per performed obligatory prayer.");
        assumptions.add("You can use one overall slider for a quick estimate or personal daily prayer sliders for a more tailored view.");

        if (includeFriday) {
            assumptions.add("Jumu'ah is estimated as one Friday prayer every 7 days with 35 minutes each.");
        }
        if (includeTarawih) {
            assumptions.add("Tarawih is estimated as 29 nights each Ramadan with 20 rakaats per night.");
        }
        if (includeEidPrayers) {
            assumptions.add("Eid prayers are estimated as one Eid al-Fitr and one Eid al-Adha prayer each year.");
        }

        return assumptions;
    }
}
