package com.prayertracker.patternviewer.api;

import com.prayertracker.patternviewer.model.PrayerStats;
import com.prayertracker.patternviewer.security.CurrentUser;
import com.prayertracker.patternviewer.service.PrayerCalculator;
import com.prayertracker.patternviewer.service.PrayerRecordService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prayer")
public class PrayerStatsController {

    //! This controller handles prayer summary requests and saved history requests.
    //! Controller ni handle request summary solat dan request history yang disimpan.
    private final PrayerCalculator calculator;
    private final PrayerRecordService prayerRecordService;

    public PrayerStatsController(PrayerCalculator calculator, PrayerRecordService prayerRecordService) {
        this.calculator = calculator;
        this.prayerRecordService = prayerRecordService;
    }

    @PostMapping("/stats")
    public PrayerStats calculate(@RequestBody PrayerStatsRequest request) {
        //? Public endpoint: anyone can ask for a calculated summary without an account.
        //? Endpoint public: sesiapa pun boleh minta summary kiraan tanpa akaun.
        return calculator.calculatePrayerStats(request);
    }

    @PostMapping("/history")
    public PrayerHistoryItem save(
            @CurrentUser com.prayertracker.patternviewer.model.AppUser user,
            @RequestBody PrayerStatsRequest request
    ) {
        //! Protected endpoint: calculate the latest summary, then save that snapshot to the database.
        //! Endpoint protected: kira summary terbaru, lepas tu simpan snapshot tu dalam database.
        PrayerStats stats = calculator.calculatePrayerStats(request);
        return prayerRecordService.save(user, request, stats);
    }

    @GetMapping("/history")
    public List<PrayerHistoryItem> history(@CurrentUser com.prayertracker.patternviewer.model.AppUser user) {
        //? This only returns records belonging to the current logged-in user.
        //? Ni hanya pulangkan rekod milik user yang tengah login sekarang.
        return prayerRecordService.listForUser(user);
    }
}
