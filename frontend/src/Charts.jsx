//! Data visualisations for the calculator, all drawn in code so they match the SVG ornaments.
//! Visualisasi data untuk kalkulator, semua dilukis dengan kod supaya sepadan dengan hiasan SVG.

function formatNumber(value) {
  return new Intl.NumberFormat().format(value ?? 0);
}

export function ConsistencyRing({ rate = 0, performed = 0 }) {
  //! A gold ring that fills to the consistency percentage, number in the centre.
  //! Cincin emas yang terisi ikut peratus konsistensi, nombor di tengah.
  //* HOW: stroke-dasharray draws only a fraction of the circle's edge — the classic donut trick.
  //* HOW: stroke-dasharray lukis sebahagian tepi bulatan sahaja — helah donut yang klasik.
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, rate));
  const filled = circumference * pct;

  return (
    <div className="ring-wrap">
      <svg viewBox="0 0 140 140" className="consistency-ring" role="img"
        aria-label={`Consistency ${Math.round(pct * 100)} percent`}>
        <circle cx="70" cy="70" r={radius} className="ring-track" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          className="ring-fill"
          strokeDasharray={`${filled} ${circumference - filled}`}
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="66" textAnchor="middle" className="ring-number">
          {Math.round(pct * 100)}%
        </text>
        <text x="70" y="86" textAnchor="middle" className="ring-caption">
          consistency
        </text>
      </svg>
      <p className="ring-note">
        ≈ {formatNumber(performed)} prayers estimated performed
      </p>
    </div>
  );
}

export function LifeMosaic({ total = 0, performed = 0 }) {
  //! One hundred tiles, each tile = 1% of the lifetime prayer estimate. Gold = performed.
  //! Seratus jubin, setiap jubin = 1% daripada anggaran solat seumur hidup. Emas = telah ditunaikan.
  const pct = total > 0 ? Math.max(0, Math.min(1, performed / total)) : 0;
  const fullTiles = Math.floor(pct * 100);
  const partialFraction = pct * 100 - fullTiles;
  const perTile = total > 0 ? Math.round(total / 100) : 0;

  return (
    <div className="mosaic-wrap">
      <div className="mosaic" role="img"
        aria-label={`${fullTiles} percent of estimated prayers performed, shown as a mosaic`}>
        {Array.from({ length: 100 }, (_, i) => {
          //? Full tiles are solid gold; the boundary tile is partly filled; the rest stay faint.
          //? Jubin penuh emas pekat; jubin sempadan terisi separuh; selebihnya kekal pudar.
          if (i < fullTiles) {
            return <span key={i} className="tile filled" />;
          }
          if (i === fullTiles && partialFraction > 0.05) {
            return (
              <span
                key={i}
                className="tile partial"
                style={{ "--fill": `${Math.round(partialFraction * 100)}%` }}
              />
            );
          }
          return <span key={i} className="tile" />;
        })}
      </div>
      <div className="mosaic-legend">
        <span><i className="tile filled legend-chip" /> performed</span>
        <span><i className="tile legend-chip" /> remaining</span>
        <span className="legend-scale">1 tile ≈ {formatNumber(perTile)} prayers</span>
      </div>
    </div>
  );
}

export function PrayerBar({ rate = 0 }) {
  //! A slim bar under each prayer row: gold portion = estimated consistency for that prayer.
  //! Bar nipis bawah setiap baris solat: bahagian emas = anggaran konsistensi solat tu.
  const pct = Math.max(0, Math.min(1, rate));
  return (
    <div className="prayer-bar" aria-hidden="true">
      <span style={{ width: `${pct * 100}%` }} />
    </div>
  );
}
