//! This file keeps all the decorative Islamic SVG artwork in one place.
//! File ni simpan semua lukisan SVG hiasan Islamik dalam satu tempat.
//! SVG means the art is drawn with code, so it stays sharp at any size and loads instantly.
//! SVG maksudnya lukisan dibuat dengan kod, jadi sentiasa tajam pada apa-apa saiz dan load serta-merta.

export function Crescent({ size = 44 }) {
  //? A crescent moon with a small star, the most recognisable symbol pairing.
  //? Bulan sabit dengan bintang kecil, pasangan simbol paling mudah dikenali.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
      className="ornament-crescent"
    >
      <path
        d="M29 4a17.5 17.5 0 1 0 0 36A15 15 0 0 1 29 4z"
        fill="currentColor"
      />
      <path
        d="M32.5 15.5l1.6 3.6 3.6 1.6-3.6 1.6-1.6 3.6-1.6-3.6-3.6-1.6 3.6-1.6z"
        fill="currentColor"
      />
    </svg>
  );
}

export function EightPointStar({ size = 18 }) {
  //? The eight-pointed star (khatam) is the building block of classic Islamic geometry.
  //? Bintang lapan bucu (khatam) ialah blok asas geometri Islamik klasik.
  //* HOW: two squares drawn on the same spot, one rotated 45 degrees, make the star shape.
  //* HOW: dua segi empat sama atas tempat sama, satu dipusing 45 darjah, jadikan bentuk bintang.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" fill="currentColor" opacity="0.85" />
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        fill="currentColor"
        transform="rotate(45 12 12)"
      />
    </svg>
  );
}

export function SectionDivider({ label }) {
  //! A thin gold rule with a star in the centre, used between big page sections.
  //! Garis emas halus dengan bintang di tengah, dipakai antara seksyen besar page.
  return (
    <div className="section-divider" role="presentation">
      <span className="divider-line" />
      <span className="divider-star">
        <EightPointStar size={14} />
      </span>
      {label ? <span className="divider-label">{label}</span> : null}
      {label ? (
        <span className="divider-star">
          <EightPointStar size={14} />
        </span>
      ) : null}
      <span className="divider-line" />
    </div>
  );
}

export function MosqueSkyline() {
  //! A quiet mosque silhouette used along the footer, like a city resting at Maghrib.
  //! Siluet masjid tenang dipakai sepanjang footer, macam bandar berehat waktu Maghrib.
  return (
    <svg
      viewBox="0 0 1200 140"
      preserveAspectRatio="xMidYMax slice"
      className="mosque-skyline"
      aria-hidden="true"
    >
      <g fill="currentColor">
        {/* //? Minaret kiri — left minaret tower with a small dome cap. */}
        <rect x="150" y="55" width="14" height="85" />
        <path d="M143 55h28l-6-12h-16z" />
        <circle cx="157" cy="36" r="6" />
        <rect x="155.5" y="24" width="3" height="8" />

        {/* //? Kubah utama — the big central onion dome sits on the main hall. */}
        <rect x="380" y="95" width="440" height="45" />
        <path d="M600 18c-10 26-78 40-78 77h156c0-37-68-51-78-77z" />
        <rect x="598" y="4" width="4" height="16" />
        <circle cx="600" cy="4" r="3.4" />
        <path d="M480 95c0-22 22-34 30-46 8 12 30 24 30 46z" />
        <path d="M660 95c0-22 22-34 30-46 8 12 30 24 30 46z" />

        {/* //? Pintu gerbang — arched doorways cut out of the hall using the background colour. */}
        <path d="M560 140v-30c0-14 9-22 18-26 9 4 18 12 18 26v30z" fill="var(--night)" />
        <path d="M500 140v-22c0-10 7-16 13-19 6 3 13 9 13 19v22z" fill="var(--night)" />
        <path d="M674 140v-22c0-10 7-16 13-19 6 3 13 9 13 19v22z" fill="var(--night)" />

        {/* //? Minaret kanan — right minaret, mirrored to balance the composition. */}
        <rect x="1036" y="55" width="14" height="85" />
        <path d="M1029 55h28l-6-12h-16z" />
        <circle cx="1043" cy="36" r="6" />
        <rect x="1041.5" y="24" width="3" height="8" />

        {/* //? Bangunan kecil — smaller side buildings so the skyline feels like a real city. */}
        <rect x="240" y="100" width="90" height="40" />
        <path d="M285 100c0-14 14-20 20-28 6 8 20 14 20 28z" transform="translate(-20 0)" />
        <rect x="880" y="100" width="90" height="40" />
        <path d="M925 100c0-14 14-20 20-28 6 8 20 14 20 28z" />
        <rect x="60" y="115" width="60" height="25" />
        <rect x="1090" y="115" width="60" height="25" />
      </g>
    </svg>
  );
}

export function Lantern({ size = 20 }) {
  //? A little fanous (Ramadan lantern) used to mark the special odd nights.
  //? Fanous kecil (tanglung Ramadan) dipakai untuk tanda malam ganjil istimewa.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M8 6h8l1.2 2.5H6.8z M7.5 8.5h9v8l-2 2.5h-5l-2-2.5z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M12 8.5v8" stroke="var(--night, #0e2823)" strokeWidth="1.2" />
      <path d="M9.5 8.5v8M14.5 8.5v8" stroke="var(--night, #0e2823)" strokeWidth="0.8" opacity="0.6" />
      <path d="M10 21h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

//! Small line icons for the stat cards, all drawn in the same stroke style so they match.
//! Ikon garis kecil untuk kad statistik, semua dilukis gaya stroke sama supaya sepadan.
const iconProps = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function IconCalendar() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function IconMosque() {
  return (
    <svg {...iconProps}>
      <path d="M4 21v-8h16v8" />
      <path d="M12 3c-1.5 3-5 4.2-5 7h10c0-2.8-3.5-4-5-7z" />
      <path d="M12 21v-4c0-1.4 1-2.3 2-2.7 1 .4 2 1.3 2 2.7" transform="translate(-2 0)" />
      <path d="M4 13V9M20 13V9" />
    </svg>
  );
}

export function IconHeartCheck() {
  return (
    <svg {...iconProps}>
      <path d="M12 20.5S3.5 15 3.5 9.3C3.5 6.4 5.8 4.5 8.2 4.5c1.6 0 3 .8 3.8 2 .8-1.2 2.2-2 3.8-2 2.4 0 4.7 1.9 4.7 4.8C20.5 15 12 20.5 12 20.5z" />
      <path d="M9 11.5l2 2 4-4" />
    </svg>
  );
}

export function IconClock() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function IconBeads() {
  //? A misbaha (tasbih beads) icon: a loop of dhikr beads with the leading imame bead.
  //? Ikon misbaha (tasbih): satu bulatan biji dhikr dengan biji imame di depan.
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="6" r="2" />
      <circle cx="17.6" cy="8.2" r="1.7" />
      <circle cx="19.6" cy="13.5" r="1.7" />
      <circle cx="16.4" cy="18.2" r="1.7" />
      <circle cx="7.6" cy="8.2" r="1.7" />
      <circle cx="5.6" cy="13.5" r="1.7" />
      <circle cx="8.8" cy="18.2" r="1.7" />
      <path d="M12 20.5v1.5" />
    </svg>
  );
}

export function IconRepair() {
  //? A gentle "return" arrow for the make-up (qadha) planner.
  //? Anak panah "kembali" yang lembut untuk perancang qadha.
  return (
    <svg {...iconProps}>
      <path d="M4 11a8 8 0 1 1 2 5.3" />
      <path d="M4 5v6h6" />
    </svg>
  );
}

export function IconHorizon() {
  //? A sunrise over a line, for the forward-looking "prayers ahead" projection.
  //? Matahari terbit atas garisan, untuk unjuran "solat di hadapan" yang memandang ke depan.
  return (
    <svg {...iconProps}>
      <path d="M3 18h18" />
      <path d="M12 8a5 5 0 0 1 5 5H7a5 5 0 0 1 5-5z" />
      <path d="M12 3v2M4.5 6.5l1.4 1.4M19.5 6.5l-1.4 1.4M2 13h1M21 13h1" />
    </svg>
  );
}

export function IconScale() {
  //? A balance scale for the zakat panel: wealth weighed, then purified.
  //? Neraca timbang untuk panel zakat: harta ditimbang, kemudian disucikan.
  return (
    <svg {...iconProps}>
      <path d="M12 3v18M8 21h8" />
      <path d="M12 5l-6 2 6-2 6 2" />
      <path d="M6 7l-3 6a3 3 0 0 0 6 0zM18 7l-3 6a3 3 0 0 0 6 0z" />
    </svg>
  );
}

export function IconOpenBook() {
  //? An open mushaf for the khatam journey panel.
  //? Mushaf terbuka untuk panel perjalanan khatam.
  return (
    <svg {...iconProps}>
      <path d="M12 6c-2-1.6-4.5-2-8-2v14c3.5 0 6 .4 8 2 2-1.6 4.5-2 8-2V4c-3.5 0-6 .4-8 2z" />
      <path d="M12 6v14" />
    </svg>
  );
}

export function IconDates() {
  //? A crescent over a bowl, for breaking and returning fasts.
  //? Bulan sabit atas mangkuk, untuk berbuka dan menggantikan puasa.
  return (
    <svg {...iconProps}>
      <path d="M17 4a5 5 0 1 0 3 8.5A6.5 6.5 0 0 1 17 4z" />
      <path d="M3 15h13a6.5 6.5 0 0 1-13 0z" />
    </svg>
  );
}

export function IconTelegram({ size = 22 }) {
  //! The Telegram paper-plane, drawn as a filled glyph so it reads at small sizes.
  //! Kapal terbang kertas Telegram, dilukis sebagai glyph penuh supaya jelas walau kecil.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21.6 4.3L2.9 11.5c-1 .4-1 1.8 0 2.1l4.6 1.5 1.8 5.6c.3.8 1.3 1 1.9.3l2.5-2.6 4.7 3.5c.7.5 1.7.1 1.9-.7l3-15.6c.2-1-.8-1.9-1.6-1.5z"
        fill="currentColor"
      />
      <path d="M8 14.8l9.4-6.6-6.9 7.5-.2 2.9z" fill="rgba(8,27,23,0.35)" />
    </svg>
  );
}
