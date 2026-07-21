package com.prayertracker.patternviewer.service;

import com.prayertracker.patternviewer.api.PrayerHistoryItem;
import com.prayertracker.patternviewer.api.PrayerStatsRequest;
import com.prayertracker.patternviewer.model.AppUser;
import com.prayertracker.patternviewer.model.PrayerRecord;
import com.prayertracker.patternviewer.model.PrayerStats;
import com.prayertracker.patternviewer.repository.PrayerRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrayerRecordService {
    //! This service saves prayer summaries to the database and reads them back later.
    //! Service ni simpan summary solat ke database dan baca balik bila perlu.
    private final PrayerRecordRepository prayerRecordRepository;

    public PrayerRecordService(PrayerRecordRepository prayerRecordRepository) {
        this.prayerRecordRepository = prayerRecordRepository;
    }

    public PrayerHistoryItem save(AppUser user, PrayerStatsRequest request, PrayerStats stats) {
        //! Input: logged-in user, request form data, and calculated stats. Output: one saved history item.
        //! Input: user yang login, data form request, dan stats yang dah dikira. Output: satu item history yang dah disimpan.
        PrayerRecord record = new PrayerRecord();
        record.setUser(user);
        record.setBirthYear(request.birthYear);
        record.setStartAge(request.startAge);
        record.setConsistencyRate(request.consistencyRate);
        record.setIncludeFriday(request.includeFriday);
        record.setIncludeTarawih(request.includeTarawih);
        record.setIncludeEidPrayers(request.includeEidPrayers);
        record.setTotalObligatoryPrayers(stats.getTotalObligatoryPrayers());
        record.setPerformedPrayers(stats.getPractice().getPerformed());
        record.setTotalMinutes(stats.getTime().getTotalMinutes());

        //? save(...) writes to the database and returns the saved row, including generated fields like id.
        //? save(...) tulis ke database dan pulangkan row yang dah disimpan, termasuk field automatik macam id.
        return map(prayerRecordRepository.save(record));
    }

    public List<PrayerHistoryItem> listForUser(AppUser user) {
        //? This fetches only one user's history so people cannot see each other's saved data.
        //? Ni ambil history milik seorang user je supaya orang tak nampak data simpanan orang lain.
        return prayerRecordRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::map)
                .toList();
    }

    private PrayerHistoryItem map(PrayerRecord record) {
        //? We return a simpler API object instead of exposing the raw database entity directly.
        //? Kita pulangkan object API yang lebih simple, bukan dedahkan entity database terus.
        return new PrayerHistoryItem(
                record.getId(),
                record.getBirthYear(),
                record.getStartAge(),
                record.getConsistencyRate(),
                record.isIncludeFriday(),
                record.isIncludeTarawih(),
                record.isIncludeEidPrayers(),
                record.getTotalObligatoryPrayers(),
                record.getPerformedPrayers(),
                record.getTotalMinutes(),
                record.getCreatedAt()
        );
    }
}
