# Changelog

What was built in each work session. Newest at the top.

## Session 2 (continued) — Phases 2, 3, 4 (part) and 8

### Phase 2 — Family and school
- **Parent view + approval:** "Ask a parent" and "Share my list" create a private link (no name included). Parents see dates, costs and places in English or Spanish and tap **Yes / No**; the student's app shows the answer.
- **Verified staff posting** at `/staff` (staff code): posts show in student searches with a ✓ Verified badge and can be recommended to the school's students.
- **Teacher dashboard** (opt-in, nickname + counts only), **counselor report** (anonymous search counts by type), **club directory**, **moderation queue**.
- **School groups** joined with a code (Me → Profile).
- **Tracker:** accomplishments, volunteer hours (with supervisor contact), certificates. **Progress dashboard** with hours by month.
- **Deadline calendar** with month view, **reminders 1 week and 1 day before** (in-app + phone notifications), **.ics download with alarms**, **Google Calendar links**, and a **time-conflict checker**.
- **Resume builder** (AI polishes the student's own bullets without adding facts) → print / save as PDF.
- **Email helper** linked from every opportunity; interview practice and essay feedback in Coach.

### Phase 3 — Discovery and exploration
- **Map view** of results, **Surprise me**, **Trending near you** (anonymous), **seasonal suggestions**, **saved searches with new-result alerts**, **similar opportunities**, **student reviews/tips** (filtered for personal info and reportable), **getting there** (Valley Metro, Metro McAllen, Brownsville Metro + ride tips).
- **Explore hub:** career explorer (22 careers, BLS pay, Texas pay + day-in-the-life videos via CareerOneStop), "What should I do?" interest quiz, college finder (Valley first), dual credit & early college guide, scholarship matcher, FAFSA/TASFA helper, trades & certifications, military & ROTC.

### Phase 8 — Money and access
- Fee waivers, free gear & supplies, and free/low-cost internet resources, each with a "search near me" button.

### Phase 4 — Skill building (started)
- **Daily challenge:** chess mate-in-one puzzles (verified by a chess engine), math problems, word of the day (EN/ES), debate prompts. Accessible chess board + type-your-move option.
- **Flashcard maker:** notes → cards (AI, or "term - definition" lines in demo mode), flip-card study mode, works offline.
- **Language practice** via Coach.

## Session 2 — Thu Oct 1, 2026 — Building the app

### Foundation
- Picked the name **Rumbo** ("direction" in Spanish) from five options. See `PLAN.md`.
- Created the Next.js 16 + TypeScript + Tailwind CSS 4 project.
- App shell with 5 tabs: **Find · Coach · Plan · People · Me** (bottom bar on phones, side bar on desktop).
- **English / Spanish** toggle on every page, plus Vietnamese (beta). Translations live in `messages/<language>/`.
- **Light / dark mode**, **dyslexia-friendly font** (OpenDyslexic), **large text**, **low data mode**, **online-only mode**.
- Accessibility: skip link, big focus rings, screen-reader labels, 44px tap targets, reduced motion.
- **Installable app (PWA)** with an offline service worker and app icons.
- Server database (Prisma + SQLite) that creates its own tables and demo school data.
- Welcome steps with an **age check** and a **parent consent screen for students under 13**.
- Plain-language **privacy page** and **Get help now** page with trusted help lines (988, Crisis Text Line in Spanish, Childhelp, Texas Abuse Hotline and more).

### Phase 1 — Core
- **Opportunity Finder** (home): friendly greeting, typed or spoken search, location (GPS or ZIP/town), results cards with every detail (or "Not listed, check with organizer"), "Why this fits you", Save, filters (big **Free only** switch, type, cost, grade, distance, online/in person, deadline, paid only).
- **AI web search** with Claude + the web search tool, and a **code check that deletes any listing whose link wasn't really in the search results**.
- **"Places that might offer this"** cards labeled *"Not a confirmed listing. Contact them first to ask."* with sample email and phone scripts.
- **Scam check** (rules + AI) and **age-appropriate filter**.
- **Demo mode** with 22 real programs (checked by hand, with official links) so the app works with no API key.
- **24-hour search cache**, **per-device daily limits**, and a **daily dollar budget** to keep costs low.
- **AI Coach** with 8 modes: Ask anything, Homework (teaches step by step, never just the answer), Mock interview, Debate, Quiz me, Email helper, Essay feedback, Language practice. Streams replies, keeps past chats, read aloud, voice input.
- **Plan Builder**: AI plans with weekly / monthly / yearly steps, checklist + progress bar, "Find opportunities" links on steps, saved opportunities that match the goal, "Ask AI to change this plan", and 8 bilingual ready-made templates.
- **Me tab**: profile, My Saved (status, notes), settings, **parental controls with a PIN**, **download / restore / delete my data**.
- **Safety**: crisis messages show help lines immediately (search, coach and plans), blocked requests, AI safety rules.
- "How the AI works" transparency page.
- Tests: unit tests (translations, safety, link verification, demo search) and Playwright tests for every page at phone and desktop size, light and dark, with automatic accessibility checks.

## Session 1 — Thu Oct 1, 2026 — Planning
- Wrote the first project plan, decided student data stays on the device, and designed the "never invent listings" check.
