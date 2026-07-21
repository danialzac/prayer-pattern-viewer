import { useEffect, useState } from "react";
import {
  Crescent,
  SectionDivider,
  MosqueSkyline,
  Lantern,
  IconCalendar,
  IconMosque,
  IconHeartCheck,
  IconClock,
  IconHorizon,
} from "./Ornaments";
import { TasbihCounter, QadhaPlanner, TelegramCard } from "./Companions";
import { ZakatPurifier, KhatamJourney, FastingReturn } from "./Planners";
import { LessonsSection } from "./Lessons";
import { calculatePrayerStatsLocal } from "./localEngine";

//! Static mode = the published demo with no Java backend: the engine runs in the browser
//! and saved summaries live in this device's localStorage instead of a database.
//! Mod static = demo yang diterbitkan tanpa backend Java: enjin jalan dalam browser
//! dan ringkasan tersimpan duduk dalam localStorage peranti ni, bukan database.
const IS_STATIC = import.meta.env.VITE_STATIC === "1";

//? BASE_URL makes image paths work both at "/" (local) and "/<repo>/" (GitHub Pages).
//? BASE_URL buat path gambar jalan di "/" (local) dan "/<repo>/" (GitHub Pages).
const MEDIA = `${import.meta.env.BASE_URL}media/`;
const LOCAL_HISTORY_KEY = "prayer-history-local";
import { ConsistencyRing, LifeMosaic, PrayerBar } from "./Charts";

const initialForm = {
  birthYear: "1995",
  startAge: "12",
  consistencyRate: 70,
  useCustomPrayerRates: false,
  fajrRate: 70,
  dhuhrRate: 70,
  asrRate: 70,
  maghribRate: 70,
  ishaRate: 70,
  includeFriday: true,
  includeTarawih: true,
  includeEidPrayers: true,
};

const initialAuth = {
  fullName: "",
  email: "",
  password: "",
};

const obligatoryPrayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const prayerRateFields = [
  { name: "fajrRate", label: "Fajr" },
  { name: "dhuhrRate", label: "Dhuhr" },
  { name: "asrRate", label: "Asr" },
  { name: "maghribRate", label: "Maghrib" },
  { name: "ishaRate", label: "Isha" },
];

const recoverySuggestions = [
  "Return gently, return today. Resume with the next prayer.",
  "Plan sleep with Fajr in mind and reduce late-night distraction.",
  "Attach prayer to fixed daily anchors so consistency feels lighter.",
];

const laylatDisclaimer =
  "Laylat al-Qadr is better than a thousand months. This app uses visual reminders to encourage worship, not to calculate exact divine reward. The full reward is with Allah.";

//! The gallery row shows three arch-framed photos, like walking past a mosque arcade.
//! Baris galeri tunjuk tiga gambar berbingkai gerbang, macam jalan lalu arked masjid.
const galleryItems = [
  {
    src: MEDIA + "blue-mosque.jpg",
    alt: "Aerial view of the Blue Mosque in Shah Alam at sunset",
    caption: "Masjid Sultan Salahuddin, Shah Alam",
    note: "Every dome began with one prayer",
  },
  {
    src: MEDIA + "prayer-hall.jpg",
    alt: "Worshippers praying inside an ornate mosque prayer hall",
    caption: "The prayer hall",
    note: "Shoulder to shoulder, heart to heart",
  },
  {
    src: MEDIA + "white-domes.jpg",
    alt: "White marble domes of the Sheikh Zayed Grand Mosque",
    caption: "Sheikh Zayed Grand Mosque",
    note: "Built for stillness and light",
  },
];

function formatNumber(value) {
  //! Small helper to make big numbers easier to read in the UI.
  //! Helper kecil ni buat nombor besar senang baca dalam UI.
  return new Intl.NumberFormat().format(value ?? 0);
}

function formatPercent(value) {
  //? Convert decimal values like 0.7 into display text like 70%.
  //? Tukar nilai decimal macam 0.7 jadi text display macam 70%.
  return `${Math.round((value ?? 0) * 100)}%`;
}

function formatDate(value) {
  //? Format saved-history dates so they look friendly to normal users.
  //? Format tarikh history yang disimpan supaya nampak mesra untuk user biasa.
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}

function buildPrayerRequest(formValues) {
  return {
    birthYear: Number(formValues.birthYear),
    startAge: Number(formValues.startAge),
    consistencyRate: Number(formValues.consistencyRate) / 100,
    useCustomPrayerRates: formValues.useCustomPrayerRates,
    fajrRate: Number(formValues.fajrRate) / 100,
    dhuhrRate: Number(formValues.dhuhrRate) / 100,
    asrRate: Number(formValues.asrRate) / 100,
    maghribRate: Number(formValues.maghribRate) / 100,
    ishaRate: Number(formValues.ishaRate) / 100,
    includeFriday: formValues.includeFriday,
    includeTarawih: formValues.includeTarawih,
    includeEidPrayers: formValues.includeEidPrayers,
  };
}

function buildInsightCards(stats) {
  //! This turns raw stats into short motivational cards for the UI.
  //! Ni tukar stats mentah jadi kad motivasi pendek untuk UI.
  if (!stats) {
    return [];
  }

  const consistency = stats.practice.consistencyRate ?? 0;
  const prayersRemaining = stats.practice.remaining ?? 0;
  const specialCount = stats.specialPrayers?.totalOccurrences ?? 0;

  return [
    {
      title: consistency >= 0.7 ? "Consistency is taking root" : "Consistency can grow gently",
      body:
        consistency >= 0.7
          ? "Your current pattern suggests steady care for the daily prayers. Consistency matters more than intensity bursts."
          : "A softer, repeatable routine usually lasts longer than short bursts of effort.",
    },
    {
      title: "Recovery remains open",
      body:
        prayersRemaining > 0
          ? `There are still ${formatNumber(prayersRemaining)} prayers marked as not consistently completed in this estimate. Return gently, return today.`
          : "This estimate shows full consistency. Keep protecting it with gratitude and steadiness.",
    },
    {
      title: "Ramadan can become a focused season",
      body:
        specialCount > 0
          ? "Tarawih, Jumu'ah, and Eid moments are displayed as reflection aids, not as exact measures of divine reward."
          : "You can turn on Ramadan and special prayer reflections whenever you want a more seasonal view.",
    },
  ];
}

function buildProjection(stats, birthYear) {
  //! A hopeful, forward-looking estimate: keep this pace to age 70, how much salah lies ahead?
  //! Anggaran penuh harapan memandang ke depan: kekal pace ni sampai umur 70, berapa banyak solat menanti?
  if (!stats) {
    return null;
  }

  //WARN The API response has no startAge field, so age must come from the birth year the user typed.
  //WARN Respons API tiada field startAge, jadi umur mesti dikira dari tahun lahir yang user taip.
  const currentAge = (stats.currentYear ?? new Date().getFullYear()) - (birthYear || 0);
  const yearsAhead = birthYear ? Math.max(0, 70 - currentAge) : 0;
  const consistency = stats.practice?.consistencyRate ?? 0;

  //* HOW: five daily prayers x ~365 days gives obligatory prayers per year ahead.
  //* HOW: lima solat sehari x ~365 hari bagi jumlah solat wajib setahun ke depan.
  const prayersAhead = Math.round(yearsAhead * 365 * 5);
  const performedAhead = Math.round(prayersAhead * consistency);

  return { yearsAhead, prayersAhead, performedAhead };
}

function buildShareText(stats) {
  //? Builds the friendly message that gets pre-filled into the Telegram share sheet.
  //? Bina mesej mesra yang diisi awal ke dalam share sheet Telegram.
  if (!stats) {
    return "I'm reflecting on a lifetime of prayer with Prayer Pattern Viewer. Return gently, return today.";
  }

  const performed = formatNumber(stats.practice?.performed);
  const consistency = formatPercent(stats.practice?.consistencyRate);
  const hours = formatNumber(stats.time?.totalHours);

  return (
    `My prayer reflection: about ${performed} prayers performed (${consistency} consistency), ` +
    `roughly ${hours} hours in salah so far. Return gently, return today. May every prayer bring light.`
  );
}

function buildRamadanNights() {
  //? This creates a simple list for nights 21 to 30 so the UI can render the last ten nights.
  //? Ni buat senarai ringkas untuk malam 21 sampai 30 supaya UI boleh render sepuluh malam terakhir.
  return Array.from({ length: 10 }, (_, index) => {
    const night = 21 + index;
    return {
      night,
      isOdd: night % 2 === 1,
      label: night % 2 === 1 ? "seek earnestly" : "possible",
    };
  });
}

function App() {
  //! React state stores values that change while the user interacts with the page.
  //! React state simpan value yang berubah masa user berinteraksi dengan page.
  const [form, setForm] = useState(initialForm);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState(initialAuth);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("prayer-token") || "");
  const [profile, setProfile] = useState(() => {
    const raw = localStorage.getItem("prayer-profile");
    return raw ? JSON.parse(raw) : null;
  });
  const [history, setHistory] = useState([]);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  //NOTE These derived values are recalculated from current data on each render.
  //NOTE Value terbitan ni dikira semula dari data semasa pada setiap render.
  const insightCards = buildInsightCards(data);
  const ramadanNights = buildRamadanNights();
  const projection = buildProjection(data, Number(form.birthYear));
  const shareText = buildShareText(data);

  async function api(path, options = {}, token = authToken) {
    //! Reusable API helper so we do not repeat fetch setup in many places.
    //! Helper API boleh guna semula supaya kita tak ulang setup fetch banyak kali.
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      //? Protected routes need the JWT token inside the Authorization header.
      //? Route protected perlukan token JWT dalam header Authorization.
      headers.Authorization = `Bearer ${token}`;
    }

    //WARN Network calls can fail, so callers of this function should be ready to handle errors.
    //WARN Panggilan network boleh gagal, jadi pemanggil function ni kena sedia handle error.
    const response = await fetch(path, { ...options, headers });
    if (!response.ok) {
      //! Read the body once as text, then try to parse JSON from that text.
      //! Baca body sekali sebagai text, lepas tu cuba parse JSON dari text tu.
      //WARN Calling response.json() then response.text() fails: the stream can only be read once.
      //WARN Panggil response.json() lepas tu response.text() akan gagal: stream cuma boleh dibaca sekali.
      const raw = await response.text();
      let message = "Request failed";
      try {
        const payload = JSON.parse(raw);
        message = payload.message || payload.error || message;
      } catch {
        message = raw || message;
      }
      throw new Error(message || "Request failed");
    }
    return response.status === 204 ? null : response.json();
  }

  async function calculate(nextForm = form) {
    //! Ask the backend for the estimate — or, in the published static demo, run the same
    //! engine right here in the browser with no network at all.
    //! Minta anggaran dari backend — atau, dalam demo static yang diterbitkan, jalankan
    //! enjin yang sama terus dalam browser tanpa network langsung.
    if (IS_STATIC) {
      setData(calculatePrayerStatsLocal(buildPrayerRequest(nextForm)));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = await api("/api/prayer/stats", {
        method: "POST",
        body: JSON.stringify(buildPrayerRequest(nextForm)),
      }, "");
      setData(payload);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function readLocalHistory() {
    //? The static demo keeps saved summaries in localStorage — private to this device.
    //? Demo static simpan ringkasan dalam localStorage — peribadi untuk peranti ni sahaja.
    try {
      return JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  }

  async function loadProfileAndHistory(token = authToken) {
    //! After login, fetch the profile and saved history together to fill the right side of the UI.
    //! Lepas login, ambil profile dengan history simpan sekali untuk penuhkan bahagian kanan UI.
    if (!token) {
      setHistory([]);
      return;
    }

    try {
      const [me, savedHistory] = await Promise.all([
        api("/api/auth/me", {}, token),
        api("/api/prayer/history", {}, token),
      ]);
      setProfile(me);
      setHistory(savedHistory);
      localStorage.setItem("prayer-profile", JSON.stringify(me));
    } catch (requestError) {
      setAuthError(requestError.message);
    }
  }

  useEffect(() => {
    //! Live calculator: every form change recalculates automatically after a short pause.
    //! Kalkulator live: setiap perubahan form kira semula secara auto selepas jeda sekejap.
    //* HOW: the timeout is the "debounce" — dragging a slider fires many changes, but only
    //* the last one (350ms after you stop) actually calls the API. The cleanup cancels the rest.
    //* HOW: timeout tu "debounce" — tarik slider cetus banyak perubahan, tapi hanya yang
    //* terakhir (350ms lepas berhenti) betul-betul call API. Cleanup batalkan yang lain.
    const timer = setTimeout(() => {
      calculate(form);
    }, 350);
    return () => clearTimeout(timer);
  }, [form]);

  useEffect(() => {
    //! In the static demo there is no login — just load whatever was saved on this device.
    //! Dalam demo static tiada login — muat sahaja apa yang tersimpan pada peranti ni.
    if (IS_STATIC) {
      setHistory(readLocalHistory());
      return;
    }

    //! Save login state in localStorage so browser refresh does not instantly log the user out.
    //! Simpan status login dalam localStorage supaya refresh browser tak terus log user keluar.
    if (authToken) {
      localStorage.setItem("prayer-token", authToken);
      loadProfileAndHistory(authToken);
    } else {
      localStorage.removeItem("prayer-token");
      localStorage.removeItem("prayer-profile");
      setProfile(null);
      setHistory([]);
    }
  }, [authToken]);

  function updateField(event) {
    //? Generic means one function can update many form fields by reading the field name.
    //? Generic maksudnya satu function boleh update banyak field form dengan baca nama field.
    const { name, type, value, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function updateAuthField(event) {
    //? Same idea as updateField, but this one is only for the auth form.
    //? Idea sama macam updateField, tapi yang ni khas untuk form auth.
    const { name, value } = event.target;
    setAuthForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    calculate();
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      //! Choose the login or register API route based on the current tab the user selected.
      //! Pilih route API login atau register ikut tab semasa yang user pilih.
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body =
        mode === "register"
          ? authForm
          : { email: authForm.email, password: authForm.password };
      const response = await api(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      }, "");
      setAuthToken(response.token);
      setProfile({ fullName: response.fullName, email: response.email });
      setAuthForm(initialAuth);
    } catch (requestError) {
      setAuthError(requestError.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function saveCurrentSummary() {
    //! Static demo: keep the summary on this device only — no account, no server, no tracking.
    //! Demo static: simpan ringkasan pada peranti ni sahaja — tiada akaun, server, atau penjejakan.
    if (IS_STATIC) {
      if (!data) {
        return;
      }
      const entry = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        birthYear: Number(form.birthYear),
        startAge: Number(form.startAge),
        consistencyRate: data.practice.consistencyRate,
        totalObligatoryPrayers: data.totalObligatoryPrayers,
        performedPrayers: data.practice.performed,
        totalMinutes: data.time.totalMinutes,
      };
      const next = [entry, ...readLocalHistory()];
      localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(next));
      setHistory(next);
      return;
    }

    //! Saving is only allowed for logged-in users because history is protected data.
    //! Simpan hanya dibenarkan untuk user yang login sebab history ni data protected.
    if (!authToken) {
      setAuthError("Please log in before saving history.");
      return;
    }

    setSaveLoading(true);
    setAuthError("");

    try {
      await api("/api/prayer/history", {
        method: "POST",
        body: JSON.stringify(buildPrayerRequest(form)),
      });
      await loadProfileAndHistory();
    } catch (requestError) {
      setAuthError(requestError.message);
    } finally {
      setSaveLoading(false);
    }
  }

  function logout() {
    //? This clears the saved token locally; it does not delete the user account.
    //? Ni clear token yang disimpan secara local; dia tak padam akaun user pun.
    setAuthToken("");
    setProfile(null);
  }

  return (
    <main className="page-shell">
      {/* //! Hero is a deep-emerald night panel with geometric pattern, calligraphy, and the auth card. */}
      {/* //! Hero ni panel malam hijau zamrud dengan corak geometri, kaligrafi, dan kad auth. */}
      <section className="hero">
        <div className="hero-pattern" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />

        <div className="hero-copy">
          <span className="hero-crescent">
            <Crescent size={52} />
          </span>
          <p className="hero-arabic" lang="ar" dir="rtl">
            الصَّلَاةُ نُورٌ
          </p>
          <p className="hero-arabic-translation">
            &ldquo;Prayer is light.&rdquo; — Sahih Muslim
          </p>
          <h1>
            A Lifetime of <em>Salah</em>, Reflected
          </h1>
          <p className="hero-text">
            Grow in prayer with gentle, hopeful guidance, reflect deeply during
            Ramadan, and keep your summaries safely secured.
          </p>
          <p className="helper-text hero-note">
            Start with one slider for a fast estimate, or open personalized prayer
            sliders when you want a closer reflection of your daily pattern.
          </p>
        </div>

        {IS_STATIC ? (
          /* //! The published demo has no server, so the login card becomes a privacy card. */
          /* //! Demo yang diterbitkan tiada server, jadi kad login bertukar jadi kad privasi. */
          <div className="auth-panel">
            <div className="logged-in-box">
              <strong>Private by design</strong>
              <p>
                This demo runs entirely in your browser. Estimates are computed on your
                device, and saved summaries stay in this browser only — no account, no
                server, nothing sent anywhere.
              </p>
            </div>
          </div>
        ) : (
        <div className="auth-panel">
          {/* //! Two tabs share one form area so the login/register UI stays simple. */}
          {/* //! Dua tab kongsi satu ruang form supaya UI login/register kekal simple. */}
          <div className="auth-header">
            <button
              type="button"
              className={mode === "login" ? "tab active" : "tab"}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === "register" ? "tab active" : "tab"}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          {profile ? (
            <div className="logged-in-box">
              <strong>{profile.fullName}</strong>
              <p>{profile.email}</p>
              <button type="button" onClick={logout}>
                Log out
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {mode === "register" ? (
                <label>
                  Full name
                  <input
                    name="fullName"
                    value={authForm.fullName}
                    onChange={updateAuthField}
                    required
                  />
                </label>
              ) : null}

              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={authForm.email}
                  onChange={updateAuthField}
                  required
                />
              </label>

              <label>
                Password
                <input
                  name="password"
                  type="password"
                  value={authForm.password}
                  onChange={updateAuthField}
                  minLength="6"
                  required
                />
              </label>

              <button type="submit" disabled={authLoading}>
                {authLoading ? "Please wait..." : mode === "register" ? "Create account" : "Sign in"}
              </button>
            </form>
          )}

          {authError ? <p className="error-text">{authError}</p> : null}
        </div>
        )}
      </section>

      {/* //! Three arch-framed photos, echoing the arcade of arches in mosque courtyards. */}
      {/* //! Tiga gambar berbingkai gerbang, ikut gaya arked gerbang di laman masjid. */}
      <section className="arch-gallery" aria-label="Mosque photography">
        {galleryItems.map((item) => (
          <figure key={item.src} className="arch-frame">
            <img src={item.src} alt={item.alt} loading="lazy" />
            <figcaption>
              <strong>{item.caption}</strong>
              <span>{item.note}</span>
            </figcaption>
          </figure>
        ))}
      </section>

      <SectionDivider label="Your Reflection" />

      <section className="content-grid secondary">
        {/* //NOTE Left side is for input, right side is for saved results. */}
        {/* //NOTE Sebelah kiri untuk input, sebelah kanan untuk hasil yang disimpan. */}
        <form className="calculator-panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Estimate Builder</p>
              <h2>Shape Your Pattern</h2>
            </div>
          </div>

          <div className="field-grid">
            <label>
              Birth year
              <input
                name="birthYear"
                type="number"
                min="1950"
                max="2026"
                value={form.birthYear}
                onChange={updateField}
              />
            </label>

            <label>
              Start age
              <input
                name="startAge"
                type="number"
                min="7"
                max="40"
                value={form.startAge}
                onChange={updateField}
              />
            </label>
          </div>

          <label className="range-field">
            General consistency rate
            <div>
              <input
                name="consistencyRate"
                type="range"
                min="0"
                max="100"
                value={form.consistencyRate}
                onChange={updateField}
              />
              <strong>{form.consistencyRate}%</strong>
            </div>
          </label>

          <p className="helper-text">
            This estimate is designed as a reflection aid. It encourages steadiness,
            tawbah, and gentle return without guilt-heavy wording.
          </p>

          <div className="mode-card">
            <label className="mode-toggle">
              <input
                name="useCustomPrayerRates"
                type="checkbox"
                checked={form.useCustomPrayerRates}
                onChange={updateField}
              />
              Use personalized daily prayer sliders
            </label>
            <p className="helper-text">
              Leave this off for the quickest estimate. Turn it on if one prayer
              is usually stronger or harder than the others.
            </p>

            {form.useCustomPrayerRates ? (
              <div className="prayer-rate-grid">
                {prayerRateFields.map((item) => (
                  <label key={item.name} className="mini-slider">
                    <span>{item.label}</span>
                    <div>
                      <input
                        name={item.name}
                        type="range"
                        min="0"
                        max="100"
                        value={form[item.name]}
                        onChange={updateField}
                      />
                      <strong>{form[item.name]}%</strong>
                    </div>
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div className="toggle-list">
            <label>
              <input
                name="includeFriday"
                type="checkbox"
                checked={form.includeFriday}
                onChange={updateField}
              />
              Include Jumu&apos;ah estimate
            </label>

            <label>
              <input
                name="includeTarawih"
                type="checkbox"
                checked={form.includeTarawih}
                onChange={updateField}
              />
              Include Tarawih
            </label>

            <label>
              <input
                name="includeEidPrayers"
                type="checkbox"
                checked={form.includeEidPrayers}
                onChange={updateField}
              />
              Include Eid prayers
            </label>
          </div>

          <p className="live-hint" role="status">
            <span className={loading ? "live-dot busy" : "live-dot"} aria-hidden="true" />
            {loading ? "Updating..." : "Live — results update as you adjust"}
          </p>

          <div className="action-row">
            {/* //? The calculator is live; this button just stores the current result in the database. */}
            {/* //? Kalkulator ni live; button ni cuma simpan result semasa ke database. */}
            <button
              type="button"
              onClick={saveCurrentSummary}
              disabled={saveLoading || !data}
            >
              {saveLoading ? "Saving..." : "Save Summary"}
            </button>
          </div>
          {error ? <p className="error-text">{error}</p> : null}
        </form>

        <article className="panel history-panel">
          {/* //? The banner image gives the saved-history panel a warm golden-hour mood. */}
          {/* //? Gambar banner bagi panel history mood waktu senja keemasan yang hangat. */}
          <div
            className="panel-banner"
            style={{ backgroundImage: `url(${MEDIA}quran-golden.jpg)` }}
            role="img"
            aria-label="A gilded Quran resting on a prayer mat at golden hour"
          />
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Saved Reflection</p>
              <h2>Your Past Summaries</h2>
            </div>
            <span>
              {IS_STATIC
                ? `${history.length} saved on this device`
                : profile
                  ? `${history.length} saved`
                  : "Login required"}
            </span>
          </div>

          <div className="history-list">
            {history.length ? (
              history.map((item) => (
                <div key={item.id} className="history-card">
                  <strong>{formatDate(item.createdAt)}</strong>
                  <p>
                    {item.birthYear} birth year, age {item.startAge} start,{" "}
                    {formatPercent(item.consistencyRate)}
                  </p>
                  <div className="special-meta">
                    <span>{formatNumber(item.totalObligatoryPrayers)} prayers</span>
                    <span>{formatNumber(item.performedPrayers)} performed</span>
                    <span>{formatNumber(item.totalMinutes)} min</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="special-card empty">
                <strong>No saved entries yet</strong>
                <p>
                  {IS_STATIC
                    ? "Tap Save Summary to keep a snapshot on this device."
                    : "Log in and save a summary to store it in the database."}
                </p>
              </div>
            )}
          </div>
        </article>
      </section>

      <SectionDivider label="Daily Companions" />

      {/* //! These two stay on screen always, since dhikr and reminders are daily, not one-time. */}
      {/* //! Dua ni sentiasa ada atas skrin, sebab zikir dan peringatan ni harian, bukan sekali je. */}
      <section className="content-grid secondary">
        <TasbihCounter />
        <TelegramCard shareText={shareText} />
      </section>

      <SectionDivider label="Worship Planners" />

      {/* //! Three self-contained planners: zakat, khatam pacing, and missed fasts. */}
      {/* //! Tiga perancang serba lengkap: zakat, pacing khatam, dan puasa ganti. */}
      <section className="planner-grid">
        <ZakatPurifier />
        <KhatamJourney />
        <FastingReturn />
      </section>

      <SectionDivider label="Tafsir Journey" />

      {/* //! Study notes from tafsir lessons — content lives in src/content/lessons/*.json. */}
      {/* //! Nota belajar dari pelajaran tafsir — kandungan duduk dalam src/content/lessons/*.json. */}
      <LessonsSection />

      {data ? (
        <>
          <SectionDivider label="The Numbers" />

          {/* //! These top cards show the main big-picture numbers first. */}
          {/* //! Kad atas ni tunjuk nombor besar yang paling penting dulu. */}
          <section className="stats-grid">
            <StatCard
              icon={<IconCalendar />}
              label="Years reflected"
              value={formatNumber(data.yearsSinceStart)}
              hint={`Starting from ${data.startYear}`}
            />
            <StatCard
              icon={<IconMosque />}
              label="Estimated obligatory prayers"
              value={formatNumber(data.totalObligatoryPrayers)}
              hint={`${formatNumber(data.totalObligatoryRakaats)} rakaats estimated`}
            />
            <StatCard
              icon={<IconHeartCheck />}
              label="Estimated performed"
              value={formatNumber(data.practice.performed)}
              hint={formatPercent(data.practice.consistencyRate)}
            />
            <StatCard
              icon={<IconClock />}
              label="Total time"
              value={`${formatNumber(data.time.totalMinutes)} min`}
              hint={`${data.time.totalHours} hours / ${data.time.totalDays} days`}
            />
          </section>

          {/* //! The visual heart of the calculator: one ring, one mosaic, the whole pattern at a glance. */}
          {/* //! Jantung visual kalkulator: satu cincin, satu mozek, seluruh corak sekali pandang. */}
          <section className="panel shape-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Visualised</p>
                <h2>The Shape of Your Pattern</h2>
              </div>
              <span>Each tile is 1% of your prayer life</span>
            </div>
            <div className="shape-grid">
              <ConsistencyRing
                rate={data.practice.consistencyRate}
                performed={data.practice.performed}
              />
              <LifeMosaic
                total={data.totalObligatoryPrayers}
                performed={data.practice.performed}
              />
            </div>
          </section>

          <section className="content-grid">
            <article className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Daily View</p>
                  <h2>Obligatory Prayer Breakdown</h2>
                </div>
                <span>{formatNumber(data.daysSinceStart)} days estimated</span>
              </div>

              <div className="table-list">
                {data.obligatoryBreakdown.map((item) => (
                  <div key={item.name} className="table-row">
                    <div>
                      <strong>{obligatoryPrayerNames[data.obligatoryBreakdown.indexOf(item)] || item.name}</strong>
                      <p>{item.description}</p>
                      <PrayerBar rate={item.consistencyRate} />
                      <span className="rate-note">{formatPercent(item.consistencyRate)} estimated consistency</span>
                    </div>
                    <div>
                      <strong>{formatNumber(item.totalOccurrences)}</strong>
                      <span>times</span>
                    </div>
                    <div>
                      <strong>{formatNumber(item.totalRakaats)}</strong>
                      <span>rakaats</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel special-panel">
              {/* //NOTE Bonus section for special prayer moments outside the five daily prayers. */}
              {/* //NOTE Bahagian bonus untuk momen solat khas di luar lima waktu harian biasa. */}
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Bonus Section</p>
                  <h2>Special Prayer Days</h2>
                </div>
                <span>{formatNumber(data.specialPrayers.totalOccurrences)} moments</span>
              </div>

              <div className="special-stack">
                {data.specialPrayers.items.length ? (
                  data.specialPrayers.items.map((item) => (
                    <div key={item.name} className="special-card">
                      <strong>{item.name}</strong>
                      <p>{item.description}</p>
                      <div className="special-meta">
                        <span>{formatNumber(item.estimatedOccurrences)} occurrences</span>
                        <span>{formatNumber(item.totalRakaats)} rakaats</span>
                        <span>{item.totalHours} hours</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="special-card empty">
                    <strong>No special prayers selected</strong>
                    <p>Turn on Tarawih, Jumu&apos;ah, or Eid prayer options above.</p>
                  </div>
                )}
              </div>
            </article>
          </section>

          <SectionDivider label="Gentle Guidance" />

          <section className="content-grid secondary">
            <article className="panel">
              {/* //? Fanned Quran pages set a soft, studious tone for the insight cards. */}
              {/* //? Muka surat Quran terkembang bagi tona lembut dan tekun untuk kad insight. */}
              <div
                className="panel-banner"
                style={{ backgroundImage: `url(${MEDIA}quran-pages.jpg)` }}
                role="img"
                aria-label="Open Quran pages fanned into a heart-like curve"
              />
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Spiritual Insight</p>
                  <h2>Gentle Reflection Cards</h2>
                </div>
                <span>Warm, not shaming</span>
              </div>

              <div className="special-stack">
                {insightCards.map((card) => (
                  <div key={card.title} className="special-card">
                    <strong>{card.title}</strong>
                    <p>{card.body}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Recovery</p>
                  <h2>Return Gently</h2>
                </div>
                <span>Mercy over panic</span>
              </div>

              <div className="assumption-list recovery-list">
                {recoverySuggestions.map((tip) => (
                  <p key={tip}>{tip}</p>
                ))}
              </div>
            </article>
          </section>

          <SectionDivider label="Return & Repair" />

          <section className="content-grid secondary">
            <QadhaPlanner remaining={data.practice.remaining} />

            <article className="panel projection-panel">
              {/* //? A forward look: instead of only counting the past, it points to salah still ahead. */}
              {/* //? Pandangan ke depan: bukan kira masa lalu je, dia tunjuk solat yang masih menanti. */}
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Looking Forward</p>
                  <h2>The Prayers Ahead</h2>
                </div>
                <span>
                  <span className="projection-icon">
                    <IconHorizon />
                  </span>
                </span>
              </div>

              {projection && projection.yearsAhead > 0 ? (
                <>
                  <p className="helper-text">
                    If you keep this pace until age 70, about{" "}
                    <strong>{formatNumber(projection.yearsAhead)}</strong> years of salah still lie
                    ahead — a fresh, open field.
                  </p>
                  <div className="projection-grid">
                    <div className="projection-cell">
                      <strong>{formatNumber(projection.prayersAhead)}</strong>
                      <span>obligatory prayers ahead</span>
                    </div>
                    <div className="projection-cell highlight">
                      <strong>{formatNumber(projection.performedAhead)}</strong>
                      <span>performed at your current consistency</span>
                    </div>
                  </div>
                  <p className="helper-text">
                    Every one of them is still unwritten. Todays niyyah shapes tomorrows pattern.
                  </p>
                </>
              ) : (
                <div className="special-card">
                  <strong>The horizon is yours to define</strong>
                  <p>Set a birth year under 70 years ago to see the salah still ahead of you.</p>
                </div>
              )}
            </article>
          </section>

          <SectionDivider label="Ramadan" />

          <section className="content-grid secondary">
            <article className="panel ramadan-panel">
              {/* //? The green dome of Masjid an-Nabawi crowns the Ramadan reflection panel. */}
              {/* //? Kubah hijau Masjid an-Nabawi jadi mahkota panel refleksi Ramadan. */}
              <div
                className="panel-banner"
                style={{ backgroundImage: `url(${MEDIA}nabawi.jpg)` }}
                role="img"
                aria-label="The green dome and minarets of Masjid an-Nabawi at golden hour"
              />
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Ramadan Reflection Mode</p>
                  <h2>Last Ten Nights</h2>
                </div>
                <span>Seek it in the odd nights</span>
              </div>

              <p className="helper-text">
                Seek it in the last ten nights of Ramadan, especially the odd nights.
              </p>

              <div className="ramadan-ribbon" aria-label="Ramadan last ten nights">
                {ramadanNights.map((night) => (
                  <div
                    key={night.night}
                    className={night.isOdd ? "night-chip odd" : "night-chip"}
                  >
                    {night.isOdd ? (
                      <span className="night-lantern">
                        <Lantern size={18} />
                      </span>
                    ) : null}
                    <strong>Night {night.night}</strong>
                    <span>{night.isOdd ? "Potential high-barakah night" : night.label}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel laylat-panel">
              {/* //? The navy-and-gold Quran photo becomes a night sky behind the Laylat al-Qadr verse. */}
              {/* //? Gambar Quran biru-emas jadi langit malam di belakang ayat Laylat al-Qadr. */}
              <div
                className="panel-banner laylat-banner"
                style={{ backgroundImage: `url(${MEDIA}quran-navy.jpg)` }}
                role="img"
                aria-label="A deep blue Quran with gold calligraphy beside scattered flowers"
              >
                <p className="laylat-arabic" lang="ar" dir="rtl">
                  لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ
                </p>
              </div>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Laylat al-Qadr View</p>
                  <h2>A Theologically Careful Reminder</h2>
                </div>
                <span>Reflection, not reward math</span>
              </div>

              <div className="special-stack">
                <div className="special-card">
                  <strong>Laylat al-Qadr is better than a thousand months</strong>
                  <p>
                    Worship on this night is better than worship across a thousand
                    months. Use this as motivation for extra prayer, Quran, dua,
                    and remembrance.
                  </p>
                </div>
                <div className="disclaimer-card" role="note" aria-label="Laylat al-Qadr disclaimer">
                  <strong>Illustrative spiritual weight</strong>
                  <p>{laylatDisclaimer}</p>
                </div>
              </div>
            </article>
          </section>
        </>
      ) : null}

      {/* //! The footer closes the page like Maghrib closes the day: a skyline and a gentle dua. */}
      {/* //! Footer tutup page macam Maghrib tutup hari: siluet bandar dan doa lembut. */}
      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-crescent">
            <Crescent size={36} />
          </span>
          <p className="footer-dua">May every prayer bring you light, steadiness, and nearness.</p>
          <p className="footer-meta">
            Estimates are reflection aids, not rulings. Photography via Unsplash.
          </p>
        </div>
        <MosqueSkyline />
      </footer>
    </main>
  );
}

export default App;
