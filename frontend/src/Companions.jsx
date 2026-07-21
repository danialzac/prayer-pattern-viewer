import { useState } from "react";
import { IconBeads, IconRepair, IconTelegram } from "./Ornaments";

//! The Telegram companion bot. One place to change the handle if it ever moves.
//! Bot teman Telegram. Satu tempat je nak tukar handle kalau dia berpindah.
const TELEGRAM_HANDLE = "mzninterfacebot";
const TELEGRAM_URL = `https://t.me/${TELEGRAM_HANDLE}`;

//! The three phrases of tasbih after salah, and how many times each is said.
//! Tiga zikir tasbih selepas solat, dan berapa kali setiap satu disebut.
//* Sunnah: SubhanAllah x33, Alhamdulillah x33, Allahu Akbar x34 = 100 in total.
//* Sunnah: SubhanAllah x33, Alhamdulillah x33, Allahu Akbar x34 = 100 semuanya.
const dhikrPhases = [
  { arabic: "سُبْحَانَ اللّٰه", latin: "SubhanAllah", meaning: "Glory be to Allah", target: 33 },
  { arabic: "الْحَمْدُ لِلّٰه", latin: "Alhamdulillah", meaning: "All praise is for Allah", target: 33 },
  { arabic: "اللّٰهُ أَكْبَر", latin: "Allahu Akbar", meaning: "Allah is the Greatest", target: 34 },
];

export function TasbihCounter() {
  //! Local state only, so every tap is instant and nothing is sent to a server.
  //! State local je, jadi setiap tekan terus laju dan tiada apa dihantar ke server.
  //* One object updated atomically, so even fast taps never lose a count (no stale state).
  //* Satu object dikemas kini secara atomik, jadi tekan laju pun tak hilang kiraan (state tak basi).
  const [state, setState] = useState({ phase: 0, count: 0, sets: 0 });

  const current = dhikrPhases[state.phase];
  const count = state.count;
  const completedSets = state.sets;
  const isPhaseDone = count >= current.target;

  function tap() {
    //? When a phrase hits its target, move to the next; after the last, one full set is done.
    //? Bila satu zikir cukup targetnya, pergi ke seterusnya; lepas yang akhir, satu set penuh siap.
    setState((s) => {
      const target = dhikrPhases[s.phase].target;
      if (s.count + 1 < target) {
        return { ...s, count: s.count + 1 };
      }
      if (s.phase < dhikrPhases.length - 1) {
        return { ...s, phase: s.phase + 1, count: 0 };
      }
      return { phase: 0, count: 0, sets: s.sets + 1 };
    });
  }

  function reset() {
    setState({ phase: 0, count: 0, sets: 0 });
  }

  return (
    <article className="panel tasbih-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">After Every Salah</p>
          <h2>Digital Tasbih</h2>
        </div>
        <span className="tasbih-sets">
          {completedSets} {completedSets === 1 ? "set" : "sets"} of 100
        </span>
      </div>

      <div className="tasbih-phase-track" aria-hidden="true">
        {dhikrPhases.map((item, index) => (
          <span
            key={item.latin}
            className={
              index === state.phase
                ? "phase-dot active"
                : index < state.phase
                  ? "phase-dot done"
                  : "phase-dot"
            }
          />
        ))}
      </div>

      {/* //! The whole disc is one big tap target, easy to press with a thumb during dhikr. */}
      {/* //! Seluruh cakera ni satu sasaran tekan besar, senang tekan guna ibu jari masa zikir. */}
      <button
        type="button"
        className={isPhaseDone ? "tasbih-disc ready" : "tasbih-disc"}
        onClick={tap}
        aria-label={`Count ${current.latin}, currently ${count} of ${current.target}`}
      >
        <span className="tasbih-icon">
          <IconBeads />
        </span>
        <span className="tasbih-arabic" lang="ar" dir="rtl">
          {current.arabic}
        </span>
        <span className="tasbih-count">
          {count}
          <small>/ {current.target}</small>
        </span>
      </button>

      <div className="tasbih-footer">
        <div>
          <strong>{current.latin}</strong>
          <p>{current.meaning}</p>
        </div>
        <button type="button" className="button-secondary tasbih-reset" onClick={reset}>
          Reset
        </button>
      </div>
    </article>
  );
}

export function QadhaPlanner({ remaining = 0 }) {
  //! Turns the "not consistently completed" estimate into a gentle, doable repayment plan.
  //! Tukar anggaran "tak konsisten siap" jadi pelan bayar balik yang lembut dan boleh buat.
  const [perDay, setPerDay] = useState(2);

  const days = remaining > 0 ? Math.ceil(remaining / perDay) : 0;
  const years = (days / 365).toFixed(1);
  const finished = remaining <= 0;

  return (
    <article className="panel qadha-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Make-Up Planner</p>
          <h2>Qadha, Step by Step</h2>
        </div>
        <span>
          <span className="qadha-icon">
            <IconRepair />
          </span>
        </span>
      </div>

      {finished ? (
        <div className="special-card">
          <strong>This estimate shows nothing to make up</strong>
          <p>Beautiful. Keep protecting your consistency with gratitude and steadiness.</p>
        </div>
      ) : (
        <>
          <p className="helper-text">
            This estimate leaves about <strong>{new Intl.NumberFormat().format(remaining)}</strong>{" "}
            prayers to return to. Pick a pace you can actually keep.
          </p>

          <label className="range-field qadha-slider">
            Extra make-up prayers per day
            <div>
              <input
                type="range"
                min="1"
                max="10"
                value={perDay}
                onChange={(event) => setPerDay(Number(event.target.value))}
              />
              <strong>{perDay}</strong>
            </div>
          </label>

          <div className="qadha-result">
            <div>
              <strong>{new Intl.NumberFormat().format(days)}</strong>
              <span>days</span>
            </div>
            <div>
              <strong>{years}</strong>
              <span>years, gently</span>
            </div>
          </div>

          <div className="disclaimer-card" role="note">
            <strong>A reflection, not a ruling</strong>
            <p>
              Whether and how to make up missed prayers is a question for a trusted scholar.
              This is only a motivating picture. Return gently, return today.
            </p>
          </div>
        </>
      )}
    </article>
  );
}

//! Example questions shown as chips, copied from what the bot is genuinely good at.
//! Contoh soalan dipaparkan sebagai cip, diambil dari apa yang bot ni memang mahir.
const botExamples = [
  "What does the Quran say about patience?",
  "Any hadith on sincerity of intention?",
  "Explain the inner dimensions of 2:255",
];

export function TelegramCard({ shareText }) {
  //! Connects the app to @mzninterfacebot — an Islamic knowledge engine over primary sources.
  //! Sambungkan app ni ke @mzninterfacebot — enjin ilmu Islam atas sumber-sumber utama.
  //NOTE The site visualises and plans; the bot answers questions. Two different jobs, one journey.
  //NOTE Site ni visualkan dan rancang; bot tu jawab soalan. Dua kerja berbeza, satu perjalanan.
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    "https://t.me/" + TELEGRAM_HANDLE,
  )}&text=${encodeURIComponent(shareText)}`;

  return (
    <article className="panel telegram-panel">
      <span className="telegram-glow" aria-hidden="true" />
      <div className="telegram-head">
        <span className="telegram-badge">
          <IconTelegram size={26} />
        </span>
        <div>
          <p className="eyebrow">Ask the Sources</p>
          <h2>Questions? Ask @{TELEGRAM_HANDLE}</h2>
        </div>
      </div>

      <p className="telegram-copy">
        This page shows you the pattern — the bot answers the questions it stirs. It searches
        the complete Quran (6,236 ayat), 4 classical tafsir traditions, and 36,000+ graded
        hadiths from 8 collections, and labels every answer as quoted, paraphrased, or
        synthesized. It does not issue fiqh rulings — for those, ask a qualified scholar.
      </p>

      <div className="bot-chips" aria-label="Example questions for the bot">
        {botExamples.map((q) => (
          <span key={q} className="bot-chip">{q}</span>
        ))}
      </div>

      <div className="telegram-actions">
        <a className="telegram-btn primary" href={TELEGRAM_URL} target="_blank" rel="noreferrer">
          <IconTelegram size={18} />
          Ask @{TELEGRAM_HANDLE}
        </a>
        <a className="telegram-btn ghost" href={shareUrl} target="_blank" rel="noreferrer">
          Share this reflection
        </a>
      </div>
    </article>
  );
}
