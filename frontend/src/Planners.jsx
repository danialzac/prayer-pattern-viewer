//! Worship planners: practical tools beyond salah — zakat, Quran khatam, and missed fasts.
//! Perancang ibadah: alat praktikal selain solat — zakat, khatam Quran, dan puasa ganti.
//NOTE All three run fully in the browser. No data leaves the page.
//NOTE Ketiga-tiganya jalan sepenuhnya dalam browser. Tiada data keluar dari page ni.
import { useState } from "react";
import { IconScale, IconOpenBook, IconDates } from "./Ornaments";

//! Shared constants, each one a fiqh-grounded number with its source noted.
//! Pemalar kongsi, setiap satu nombor berasas fiqh dengan sumbernya dicatat.
const NISAB_GOLD_GRAMS = 85; // classical nisab: 85g of gold / nisab klasik: 85g emas
const ZAKAT_RATE = 0.025; // 2.5% on zakatable wealth / 2.5% atas harta yang layak zakat
const MUSHAF_PAGES = 604; // standard Madani mushaf / mushaf Madani standard
const MUSHAF_JUZ = 30;

function sgd(value) {
  //? Money is shown in SGD because this app's home base is Singapore.
  //? Duit dipaparkan dalam SGD sebab pangkalan app ni Singapura.
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function toNumber(value) {
  //WARN Empty inputs become 0, never NaN, so the totals stay calm while the user types.
  //WARN Input kosong jadi 0, bukan NaN, supaya jumlah kekal tenang masa user menaip.
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function ZakatPurifier() {
  //! Weighs zakatable wealth against the gold nisab and shows the 2.5% due if it applies.
  //! Timbang harta yang layak zakat lawan nisab emas dan tunjuk 2.5% yang perlu jika berkenaan.
  const [values, setValues] = useState({
    savings: "",
    investments: "",
    goldGrams: "",
    debts: "",
    goldPrice: "110",
  });

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  const goldPrice = toNumber(values.goldPrice);
  const nisab = goldPrice * NISAB_GOLD_GRAMS;
  const net =
    toNumber(values.savings) +
    toNumber(values.investments) +
    toNumber(values.goldGrams) * goldPrice -
    toNumber(values.debts);
  const aboveNisab = nisab > 0 && net >= nisab;
  const due = aboveNisab ? net * ZAKAT_RATE : 0;
  const hasInput =
    toNumber(values.savings) + toNumber(values.investments) + toNumber(values.goldGrams) > 0;

  return (
    <article className="panel planner-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Purify Wealth</p>
          <h2>Zakat, Made Clear</h2>
        </div>
        <span className="planner-icon"><IconScale /></span>
      </div>

      <div className="planner-fields">
        <label>
          Cash &amp; savings (SGD)
          <input name="savings" type="number" min="0" inputMode="decimal"
            value={values.savings} onChange={update} placeholder="0" />
        </label>
        <label>
          Investments at value (SGD)
          <input name="investments" type="number" min="0" inputMode="decimal"
            value={values.investments} onChange={update} placeholder="0" />
        </label>
        <label>
          Gold owned (grams)
          <input name="goldGrams" type="number" min="0" inputMode="decimal"
            value={values.goldGrams} onChange={update} placeholder="0" />
        </label>
        <label>
          Immediate debts (SGD)
          <input name="debts" type="number" min="0" inputMode="decimal"
            value={values.debts} onChange={update} placeholder="0" />
        </label>
        <label>
          Gold price per gram (SGD)
          <input name="goldPrice" type="number" min="0" inputMode="decimal"
            value={values.goldPrice} onChange={update} />
        </label>
      </div>

      <div className="planner-result">
        <div className="planner-cell">
          <strong>{sgd(nisab)}</strong>
          <span>nisab threshold ({NISAB_GOLD_GRAMS}g gold)</span>
        </div>
        <div className={aboveNisab ? "planner-cell highlight" : "planner-cell"}>
          <strong>{hasInput ? sgd(due) : "—"}</strong>
          <span>
            {hasInput
              ? aboveNisab
                ? "zakat due (2.5%)"
                : "below nisab — no zakat due"
              : "enter your amounts above"}
          </span>
        </div>
      </div>

      <div className="disclaimer-card" role="note">
        <strong>A starting point, not a fatwa</strong>
        <p>
          Zakat also requires one lunar year of possession (hawl), and asset rules differ by
          madhhab. In Singapore, confirm and pay through Zakat.sg (MUIS) or a scholar you trust.
        </p>
      </div>
    </article>
  );
}

export function KhatamJourney() {
  //! Paces a full Quran reading: pick the days, see pages per day and per prayer.
  //! Aturkan bacaan khatam Quran: pilih hari, nampak muka surat sehari dan selepas setiap solat.
  const [days, setDays] = useState(30);

  const pagesPerDay = Math.ceil(MUSHAF_PAGES / days);
  //* HOW: dividing the daily pages across the 5 prayers turns a big goal into a tiny habit.
  //* HOW: bahagikan muka surat harian ikut 5 waktu solat tukar matlamat besar jadi tabiat kecil.
  const pagesPerPrayer = Math.round((pagesPerDay / 5) * 10) / 10;
  const juzPerDay = Math.round((MUSHAF_JUZ / days) * 10) / 10;
  const finishDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return (
    <article className="panel planner-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Quran Pacer</p>
          <h2>Khatam Journey</h2>
        </div>
        <span className="planner-icon"><IconOpenBook /></span>
      </div>

      <label className="range-field">
        Finish the Quran in
        <div>
          <input type="range" min="7" max="120" value={days}
            onChange={(event) => setDays(Number(event.target.value))} />
          <strong>{days} days</strong>
        </div>
      </label>

      <div className="planner-result">
        <div className="planner-cell highlight">
          <strong>{pagesPerDay}</strong>
          <span>pages a day ({juzPerDay} juz)</span>
        </div>
        <div className="planner-cell">
          <strong>{pagesPerPrayer}</strong>
          <span>pages after each of the 5 prayers</span>
        </div>
      </div>

      <p className="helper-text">
        Keep this pace and you complete all {MUSHAF_PAGES} pages by{" "}
        <strong>{formatDate(finishDate)}</strong>. A few pages after every salah — the mushaf
        is already open in your heart by then.
      </p>
    </article>
  );
}

export function FastingReturn() {
  //! Plans the return of missed Ramadan fasts at a realistic weekly pace.
  //! Rancang ganti puasa Ramadan yang tertinggal pada kadar mingguan yang realistik.
  const [missed, setMissed] = useState("");
  const [perWeek, setPerWeek] = useState(2);
  const [fidyahRate, setFidyahRate] = useState("7.50");

  const missedDays = Math.floor(toNumber(missed));
  const weeks = missedDays > 0 ? Math.ceil(missedDays / perWeek) : 0;
  const finishDate = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000);
  const fidyahTotal = missedDays * toNumber(fidyahRate);

  return (
    <article className="panel planner-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Ramadan Repair</p>
          <h2>Fasts to Return</h2>
        </div>
        <span className="planner-icon"><IconDates /></span>
      </div>

      <div className="planner-fields">
        <label>
          Estimated missed fasting days
          <input type="number" min="0" inputMode="numeric" value={missed}
            onChange={(event) => setMissed(event.target.value)} placeholder="0" />
        </label>
      </div>

      <label className="range-field">
        Make-up fasts per week
        <div>
          <input type="range" min="1" max="6" value={perWeek}
            onChange={(event) => setPerWeek(Number(event.target.value))} />
          <strong>{perWeek}</strong>
        </div>
      </label>

      <div className="planner-result">
        <div className="planner-cell highlight">
          <strong>{weeks || "—"}</strong>
          <span>{weeks ? `weeks — done by ${formatDate(finishDate)}` : "enter missed days above"}</span>
        </div>
        <div className="planner-cell">
          <strong>{missedDays ? sgd(fidyahTotal) : "—"}</strong>
          <span>
            fidyah if unable to fast, at{" "}
            <input className="inline-input" type="number" min="0" step="0.5" inputMode="decimal"
              value={fidyahRate} onChange={(event) => setFidyahRate(event.target.value)}
              aria-label="Fidyah rate per day in SGD" />{" "}
            SGD/day
          </span>
        </div>
      </div>

      <div className="disclaimer-card" role="note">
        <strong>Two different doors</strong>
        <p>
          Making up the fast is for those who can; fidyah is for those who genuinely cannot.
          Which applies to you, and the rate, is a question for a scholar — in Singapore the
          yearly fidyah rate is published by MUIS.
        </p>
      </div>
    </article>
  );
}
