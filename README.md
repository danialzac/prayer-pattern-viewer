# Prayer Pattern Viewer

A lifetime of salah, reflected. Estimate your prayer pattern from a few inputs, see it
visualised honestly but gently, and plan the way back — with worship planners for zakat,
Quran khatam pacing, and missed fasts.

**Live demo:** https://danialzac.github.io/prayer-pattern-viewer/
(the demo runs fully in your browser — estimates on-device, saves in localStorage, nothing sent anywhere)

## Features

- **Live estimate** — birth year + start age + consistency sliders; every number on the page
  updates as you adjust, no submit button
- **Visualised** — consistency ring, a 100-tile "life mosaic" (each tile is 1% of your
  lifetime estimate), and per-prayer consistency bars
- **Per-prayer detail** — optional Fajr–Isha sliders, Jumu'ah / Tarawih / Eid toggles,
  time totals in minutes, hours, and days
- **Return & repair** — a paced qadha (make-up) planner and a forward projection of the
  prayers still ahead of you
- **Worship planners** — zakat against the 85g-gold nisab (SGD), Quran khatam pacing
  (pages per day and per prayer), and a missed-fasts return plan with fidyah
- **Daily companions** — a digital tasbih for post-salah dhikr, and a link to
  [@mzninterfacebot](https://t.me/mzninterfacebot), a Telegram knowledge engine that answers
  questions from the Quran, classical tafsir, and graded hadith collections
- **Ramadan mode** — the last ten nights with the odd nights highlighted, and a
  theologically careful Laylat al-Qadr reminder
- **Accounts (full-stack mode)** — register/login with JWT, save summaries to a database

The wording throughout is deliberately gentle: estimates are reflection aids, not rulings,
and the app never issues fiqh verdicts.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, hand-rolled CSS, all decorative art drawn as inline SVG |
| Backend | Spring Boot 3, Spring Security + JWT, JPA |
| Database | H2 by default, MySQL via environment variables |
| Static demo | The same React app with the estimate engine ported to the browser |

## Run locally

### Full stack

```bash
# backend — serves the app and API on :8080
cd backend
mvn spring-boot:run

# frontend dev server with hot reload (proxies /api to :8080)
cd frontend
npm install
npm run dev
```

Production build (writes into `backend/src/main/resources/static` so Spring serves it):

```bash
cd frontend && npm run build
```

### Static demo build

```bash
cd frontend && VITE_STATIC=1 npx vite build --base=/prayer-pattern-viewer/ --outDir ../docs
```

`VITE_STATIC=1` switches the app to the in-browser engine (`src/localEngine.js`) and
localStorage saves; without it, the app talks to the Spring API.

### MySQL instead of H2

```bash
export DB_URL=jdbc:mysql://localhost:3306/prayer_pattern_viewer
export DB_USERNAME=your_mysql_user
export DB_PASSWORD=your_mysql_password
export DB_DRIVER=com.mysql.cj.jdbc.Driver
export JWT_SECRET=replace-with-a-long-random-secret
```

## API

| Method | Path | Auth |
|---|---|---|
| POST | `/api/prayer/stats` | public |
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | JWT |
| GET / POST | `/api/prayer/history` | JWT |

## Calculation assumptions

- Start year = birth year + the age prayer practice began; 365.25 days per year
- 5 prayers / 17 rakaats daily; 6 minutes per performed prayer
- Jumu'ah weekly (35 min), Tarawih 29 nights per Ramadan (20 rakaats, 60 min), one prayer
  for each Eid
- The backend (`PrayerCalculator.java`) and the browser engine (`localEngine.js`) implement
  the same maths and must be kept in sync

Photography via Unsplash (free licence).
