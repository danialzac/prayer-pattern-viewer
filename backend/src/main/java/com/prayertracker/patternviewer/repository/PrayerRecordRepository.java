package com.prayertracker.patternviewer.repository;

import com.prayertracker.patternviewer.model.PrayerRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

//! This repository reads and writes saved prayer summary records.
//! Repository ni baca dan simpan rekod summary solat yang disimpan.
public interface PrayerRecordRepository extends JpaRepository<PrayerRecord, Long> {
    //? Spring builds this query from the method name: get one user's records, newest first.
    //? Spring bina query ni dari nama method: ambil rekod seorang user, yang paling baru dulu.
    List<PrayerRecord> findByUserIdOrderByCreatedAtDesc(Long userId);
}
