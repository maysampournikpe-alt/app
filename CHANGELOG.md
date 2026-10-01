# Changelog

What was built in each work session. Newest at the top.

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
