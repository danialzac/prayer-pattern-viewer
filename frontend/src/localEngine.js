//! Browser port of the backend PrayerCalculator, used when the site runs without a server
//! (the published static demo). Same maths, same field names, same JSON shape.
//! Port browser untuk PrayerCalculator backend, dipakai bila site jalan tanpa server
//! (demo static yang diterbitkan). Kiraan sama, nama field sama, bentuk JSON sama.
//WARN If backend/src/.../PrayerCalculator.java changes, mirror the change here.
//WARN Kalau backend/src/.../PrayerCalculator.java berubah, cerminkan perubahan tu di sini.

const ASSUMPTIONS = {
  DAILY_PRAYERS: 5,
  DAILY_RAKAATS: 17,
  DAYS_PER_YEAR: 365.25,
  MINUTES_PER_PRAYER: 6,
  FRIDAY_PRAYER_MINUTES: 35,
  TARAWIH_NIGHTS_PER_RAMADAN: 29,
  TARAWIH_RAKAATS: 20,
  TARAWIH_MINUTES: 60,
  EID_PRAYER_RAKAATS: 2,
  EID_PRAYER_MINUTES: 20,
};

//? Mirrors the DailyPrayer enum: internal names stay SUBUH/ZUHR so the UI mapping still works.
//? Cermin enum DailyPrayer: nama dalaman kekal SUBUH/ZUHR supaya pemetaan UI masih jalan.
const DAILY_PRAYERS = [
  { name: "SUBUH", description: "Early morning prayer", rakaats: 2, rateKey: "fajrRate" },
  { name: "ZUHR", description: "Midday prayer", rakaats: 4, rateKey: "dhuhrRate" },
  { name: "ASR", description: "Late afternoon prayer", rakaats: 4, rateKey: "asrRate" },
  { name: "MAGHRIB", description: "Sunset prayer", rakaats: 3, rateKey: "maghribRate" },
  { name: "ISHA", description: "Night prayer", rakaats: 4, rateKey: "ishaRate" },
];

function clampRate(rate) {
  //WARN Same guard as the backend: keep rates between 0 and 1.
  //WARN Kawalan sama macam backend: pastikan rate antara 0 dan 1.
  return Math.max(0, Math.min(rate, 1));
}

function resolvePrayerRate(request, prayer) {
  const defaultRate = clampRate(request.consistencyRate);
  if (!request.useCustomPrayerRates) {
    return defaultRate;
  }
  const custom = request[prayer.rateKey];
  return custom == null ? defaultRate : clampRate(custom);
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

export function calculatePrayerStatsLocal(request) {
  const currentYear = new Date().getFullYear();
  const startYear = request.birthYear + request.startAge;
  const yearsSinceStart = Math.max(currentYear - startYear, 0);
  const daysSinceStart = Math.max(Math.round(yearsSinceStart * ASSUMPTIONS.DAYS_PER_YEAR), 0);
  const totalObligatoryPrayers = daysSinceStart * ASSUMPTIONS.DAILY_PRAYERS;
  const totalObligatoryRakaats = daysSinceStart * ASSUMPTIONS.DAILY_RAKAATS;

  const obligatoryBreakdown = DAILY_PRAYERS.map((prayer) => {
    const rate = resolvePrayerRate(request, prayer);
    return {
      name: prayer.name,
      description: prayer.description,
      rakaatsPerPrayer: prayer.rakaats,
      totalOccurrences: daysSinceStart,
      estimatedPerformed: Math.round(daysSinceStart * rate),
      totalRakaats: daysSinceStart * prayer.rakaats,
      consistencyRate: rate,
    };
  });

  const performed = obligatoryBreakdown.reduce((sum, item) => sum + item.estimatedPerformed, 0);
  const practice = {
    performed,
    remaining: totalObligatoryPrayers - performed,
    consistencyRate: totalObligatoryPrayers === 0 ? 0 : performed / totalObligatoryPrayers,
  };

  //! Special prayers: Jumu'ah weekly, Tarawih 29 nights a year, one prayer for each Eid.
  //! Solat khas: Jumaat setiap minggu, Tarawih 29 malam setahun, satu solat untuk setiap Raya.
  const items = [];
  if (request.includeFriday) {
    const fridayCount = Math.floor(daysSinceStart / 7);
    items.push({
      name: "Jumu'ah",
      description: "Estimated weekly Friday congregational prayers.",
      estimatedOccurrences: fridayCount,
      rakaatsPerOccurrence: 2,
      totalRakaats: fridayCount * 2,
      totalMinutes: fridayCount * ASSUMPTIONS.FRIDAY_PRAYER_MINUTES,
    });
  }
  if (request.includeTarawih) {
    const tarawihCount = yearsSinceStart * ASSUMPTIONS.TARAWIH_NIGHTS_PER_RAMADAN;
    items.push({
      name: "Tarawih",
      description: "Estimated Ramadan night prayers using 29 nights each year.",
      estimatedOccurrences: tarawihCount,
      rakaatsPerOccurrence: ASSUMPTIONS.TARAWIH_RAKAATS,
      totalRakaats: tarawihCount * ASSUMPTIONS.TARAWIH_RAKAATS,
      totalMinutes: tarawihCount * ASSUMPTIONS.TARAWIH_MINUTES,
    });
  }
  if (request.includeEidPrayers) {
    for (const eid of [
      ["Eid al-Fitr", "One Eid prayer each Ramadan completion."],
      ["Eid al-Adha", "One Eid prayer each year during Dhul Hijjah."],
    ]) {
      items.push({
        name: eid[0],
        description: eid[1],
        estimatedOccurrences: yearsSinceStart,
        rakaatsPerOccurrence: ASSUMPTIONS.EID_PRAYER_RAKAATS,
        totalRakaats: yearsSinceStart * ASSUMPTIONS.EID_PRAYER_RAKAATS,
        totalMinutes: yearsSinceStart * ASSUMPTIONS.EID_PRAYER_MINUTES,
      });
    }
  }
  //? getTotalHours on the backend rounds to 1 decimal, so we do the same here.
  //? getTotalHours kat backend bundarkan ke 1 titik perpuluhan, jadi kita buat sama.
  for (const item of items) {
    item.totalHours = round1(item.totalMinutes / 60);
  }
  const specialPrayers = {
    totalOccurrences: items.reduce((sum, item) => sum + item.estimatedOccurrences, 0),
    totalMinutes: items.reduce((sum, item) => sum + item.totalMinutes, 0),
    items,
  };

  let obligatoryMinutes = performed * ASSUMPTIONS.MINUTES_PER_PRAYER;
  if (request.includeFriday) {
    obligatoryMinutes += Math.floor(daysSinceStart / 7) * ASSUMPTIONS.FRIDAY_PRAYER_MINUTES;
  }
  const totalMinutes = obligatoryMinutes + specialPrayers.totalMinutes;
  const time = {
    obligatoryMinutes,
    specialMinutes: specialPrayers.totalMinutes,
    totalMinutes,
    totalHours: round1(totalMinutes / 60),
    totalDays: Math.round((totalMinutes / 1440) * 100) / 100,
  };

  const assumptions = [
    "Start year is estimated as birth year plus the age when prayer practice began.",
    "Day totals use 365.25 days per year because the exact birth date is not provided.",
    "Daily prayer time uses an average of 6 minutes per performed obligatory prayer.",
    "You can use one overall slider for a quick estimate or personal daily prayer sliders for a more tailored view.",
  ];
  if (request.includeFriday) {
    assumptions.push("Jumu'ah is estimated as one Friday prayer every 7 days with 35 minutes each.");
  }
  if (request.includeTarawih) {
    assumptions.push("Tarawih is estimated as 29 nights each Ramadan with 20 rakaats per night.");
  }
  if (request.includeEidPrayers) {
    assumptions.push("Eid prayers are estimated as one Eid al-Fitr and one Eid al-Adha prayer each year.");
  }

  return {
    currentYear,
    startYear,
    yearsSinceStart,
    daysSinceStart,
    totalObligatoryPrayers,
    totalObligatoryRakaats,
    practice,
    time,
    obligatoryBreakdown,
    specialPrayers,
    assumptions,
  };
}
