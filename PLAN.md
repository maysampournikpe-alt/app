# Rumbo — Project Plan

**Competition:** 2026 Congressional App Challenge · deadline Mon Oct 26, 2026, 12:00 PM ET
**Who it's for:** middle and high school students (ages 11–18) in the Rio Grande Valley of South Texas and anywhere else.
**What it does:** helps students find real opportunities near them, build skills, and reach their goals — in English and Spanish.

---

## 1. The name

Five options, picked to work in both English and Spanish:

| Option | Meaning | Verdict |
|---|---|---|
| **Rumbo** | Spanish for "direction / heading." *"¿Cuál es tu rumbo?"* = "Where are you headed?" | ✅ **Chosen.** Short, easy to say in both languages, sounds like a real app, fits the mission. |
| Faro | "Lighthouse" | Nice image, but it's about the app, not the student. |
| Sendero | "Trail" | Pretty, but harder for English speakers to say. |
| AbrePuertas | "Door opener" | Clear meaning, but long for a phone icon. |
| ValleUp | Valley + level up | Fun, but only makes sense in the RGV. |

**Tagline:** *Find your path. Encuentra tu rumbo.*

---

## 2. Tech decisions

| Area | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4** | Pages and the server API live in one project. |
| Student data | **On the student's own device** (browser storage via Zustand `persist`) | No login, almost no personal data on a server (good for COPPA), works offline. *"Your data stays on your phone."* |
| Server database | **Prisma ORM + SQLite** (local). Same schema can switch to **Postgres** (Supabase/Neon) for a permanent deployed database. | SQLite needs zero setup. The server only stores shared things (search cache, rate limits, school groups, staff posts, parent links). |
| AI | **Anthropic TypeScript SDK**, `web_search` server tool, model set in `.env` (`AI_MODEL`, default `claude-opus-5-5`) | Key stays on the server. Every AI call goes through `src/app/api/*` routes. |
| AI output safety | AI returns JSON → checked with **Zod** → every source link is checked against the URLs the web search really returned | The AI can't invent listings; anything without a real source is dropped. |
| i18n | Our own tiny translator: `messages/en.json`, `messages/es.json`, `messages/vi.json` | Add a language = add one file + one line in `src/i18n/config.ts`. Missing words fall back to English. |
| PWA / offline | `app/manifest.ts` + a hand-written service worker (`public/sw.js`) | Installable on phones. Saved items, plans, and tools work offline. |
| Voice | Browser **Web Speech API** (speech-to-text) + **speechSynthesis** (read aloud) | Free, no extra API cost. |
| Location | Browser geolocation **or** a typed ZIP/city. Bundled public **U.S. Census** ZIP and place coordinates for Texas. | No paid maps API. Only a city name goes to the AI, never exact coordinates. |
| Maps | Leaflet + OpenStreetMap tiles (turned off in Low data mode) | Free. |
| Rate limiting | Per-device daily limits + a global daily dollar cap, stored in the database. 24-hour search cache. | Keeps AI costs low. If the cap is hit, the app falls back to cached and demo results. |
| Demo mode | With no API key, every AI feature uses built-in demo logic and clearly-labeled sample data | The app always works and looks complete. |
| Tests | **Vitest** (logic) + **Playwright** (every page at phone and desktop size, light and dark, with **axe** accessibility checks) | |

---

## 3. Navigation

Five tabs (bottom bar on phones, side bar on desktop): **Find · Coach · Plan · People · Me**.
Every page has a header with the **language toggle** and a **quick settings** button (theme, dyslexia font, large text, low data, read aloud).

| Tab | What lives there |
|---|---|
| **Find** | Opportunity finder (home), filters, map, Surprise me, trending, seasonal picks, search history & saved searches, **Explore**: careers, interest quiz, colleges, dual enrollment, scholarships, FAFSA helper, trades, military/ROTC, money & access help (fee waivers, free gear, free internet) |
| **Coach** | AI chat with modes (Ask, Homework, Mock interview, Debate, Quiz me, Email helper, Essay feedback, Language practice), **Practice**: daily challenge, flashcards, practice tests, speaking coach, skill courses |
| **Plan** | Goal plans + templates, deadline calendar & reminders, weekly schedule builder, balance meter & burnout check, budget planner, packing lists, wellbeing |
| **People** | Safe, moderated, group-only spaces: school group (code), team finder, study rooms, mentor Q&A, club directory, alumni stories, shared plans, event buddy, parent carpool board |
| **Me** | Profile, saved opportunities, progress dashboard, XP/levels/badges/streaks, monthly challenges, accomplishments, volunteer hours, certificates, resume builder, year in review, avatar, settings, parental controls, download/delete my data, privacy & "How the AI works" |

---

## 4. Build order (phases)

Each phase must build, lint, type-check and pass tests before the next one starts.

0. **Foundation** — shell, tabs, i18n, themes, accessibility settings, PWA, database, onboarding with age check + parent consent (under 13), privacy page, demo data.
1. **Core** — Finder (AI web search + demo), Coach, Plan Builder, Profile, Safety basics (crisis help, scam check, age filter, refusals).
2. **Family & school** — parent share link with yes/no approval, verified staff posts, teacher dashboard, counselor reports, accomplishments/hours/certificates, progress dashboard, calendar + reminders + .ics/Google Calendar links + conflict checker, resume PDF, application/essay/interview help.
3. **Discovery** — map, surprise me, trending, similar, seasonal, online-only, history, saved-search alerts, reviews, transportation; careers, quiz, videos, colleges, dual enrollment, scholarships, FAFSA, trades, military.
4. **Skills** — courses, daily challenge, flashcards, practice tests, speaking coach, language practice.
5. **Life skills** — weekly schedule, budget, packing lists.
6. **People** — moderated groups only (details in §6).
7. **Wellbeing** — burnout check, stress tips, help lines, balance meter.
8. **Money & access** — fee waivers, free gear, free internet.
9. **Motivation** — XP, levels, streaks, badges, monthly challenges, school leaderboard, year in review, avatar, celebration screen, printable flyers.
10. **Extra accessibility & trust** — voice, read aloud, offline, more languages, parental controls, data download/delete, transparency page.

---

## 5. How "the AI must never invent listings" is enforced (in code)

1. The AI may only return listings it found with the web search tool, each with a `sourceUrl`.
2. **The server collects every URL the search actually returned in that request and removes any listing whose link isn't one of them.**
3. Blank details show **"Not listed, check with organizer."** The AI is told never to guess.
4. "Places that might offer this" are a separate type (`suggestion`), always labeled **"Not a confirmed listing. Contact them first to ask."**, with a sample email and phone script.
5. A second, rule-based **scam check** runs on every result (upfront fees, SSN/bank requests, gift cards, "guaranteed" pay, pressure words…).

---

## 6. People tab safety design

- **Groups only.** There is no private 1-to-1 messaging anywhere in the app.
- **Every post is filtered on the server** before it's saved: phone numbers, emails, street addresses, social media handles/links are automatically removed; profanity and bullying words are blocked.
- **Report button** on every post. A post with reports is hidden until a staff member reviews it.
- **School groups need a code** from a teacher, parent, or school. Staff, mentors, and parents each have their own code, and their posts get a role badge.
- Students only show a **nickname** (filtered too). No photos, no real names.
- **Parent carpool board** requires the parent code.

---

## 7. Folder structure

```
app/
├── messages/              # Translations (en.json, es.json, vi.json)
├── prisma/                # schema.prisma + seed.ts (demo school, groups)
├── public/                # sw.js (offline), icons/, fonts/
├── scripts/               # icon generator, Census data builder, schema switcher
├── src/
│   ├── app/               # Pages (folder = URL) and api/ routes (server only)
│   ├── components/        # UI building blocks, grouped by feature
│   ├── data/              # Demo opportunities, templates, careers, colleges, guides, question banks…
│   ├── i18n/              # Language config + translator
│   ├── lib/               # ai/, safety/, store (on-device data), geo, ratelimit, cache, db
│   └── types/
├── tests/                 # e2e/ (Playwright) and unit/ (Vitest)
├── PLAN.md · README.md · CHANGELOG.md · CHALLENGES.md · .env.example
```

---

## 8. Database design

### A. On the student's device (browser storage). Personal data lives here only.

| Data | Fields |
|---|---|
| `profile` | nickname?, birthYear, grade, school?, zip?/city?, interests[], skills[], goals[], transport, firstGen?, counselor contact? |
| `settings` | locale, theme, dyslexiaFont, largeText, lowData, onlineOnly, voice/readAloud |
| `consent` | onboarded, under13, parentConsentAt, parental controls (PIN-locked) |
| `saved` | opportunity snapshot, status (saved/applied/accepted/declined), parent decision, notes |
| `plans` | goal, grade, hours/week, milestones (week/month/year, done) |
| `chats` | mode, messages (last 20 chats) |
| tracking | accomplishments, volunteer hours, certificates, reminders, notifications |
| tools | search history, saved searches, flashcard decks, schedule blocks, budget, packing lists |
| motivation | XP, badges, streak, avatar, challenges |

### B. On the server (Prisma). Only shared or protective data.

| Table | Purpose |
|---|---|
| `SearchCache` | Same search within 24h costs $0 |
| `UsageEvent` | Rate limits + daily budget cap (hashed device ID, never raw IP) |
| `School` | Name + student / staff / parent / mentor codes |
| `StaffPost` | Verified opportunities posted by teachers/counselors (✓ Verified badge in search) |
| `Recommendation` | Teacher → students in their school group |
| `ParentShare` | Private link for parent summary and yes/no approval |
| `Group`, `Post`, `Report` | Moderated People spaces |
| `EventAttendance` | Event buddy (school group only) |
| `Review` | Student ratings & tips (filtered, reportable) |
| `SaveCount` | Anonymous "trending near you" counts |
| `SearchStat` | Anonymous counselor reports (category counts) |
| `EngagementStat` | Opt-in teacher dashboard (nickname + counts only) |
| `HoursContribution` | School volunteer-hour totals for the leaderboard (school totals only) |
| `SharedPlan` | Friends following the same plan (share code) |
| `Club` | School club directory |

---

## 9. "Done" checklist for each phase

- Works at **375px** (small phone) and desktop — checked with Playwright screenshots
- Works in **English and Spanish** with no missing words (unit test checks every key)
- **Light and dark** pass automated **axe** accessibility checks
- Keyboard only works everywhere
- Works in **demo mode** with no API key
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass
- `CHANGELOG.md` and `CHALLENGES.md` updated, committed to Git
