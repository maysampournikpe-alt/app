# Changelog

What was built in each work session. Newest at the top.

## Session 7 — Thu Oct 8, 2026 — Bold color-block redesign

- Brand-new poster look: huge uppercase Archivo Black headlines, a full-width color block at the top of each page, black header and tab bar, sharp corners, black outlines and hard offset shadows.
- Every tab has its own color: Find yellow, Coach blue, Plan orange, People green, Me pink. Menu cards take turns showing yellow, blue, orange, green and pink blocks.
- Body text keeps the easy-to-read font; the dyslexia option turns off all-caps headlines. All accessibility and contrast checks still pass.

## Session 6 — Thu Oct 8, 2026 — Playful game-like look

- New design inspired by learning games: chunky "3D" buttons, chips and cards with a thicker bottom edge that press down when tapped, bright teal and sunshine-yellow colors, and the rounded Nunito font for headings and buttons (self-hosted, with Vietnamese letters).
- Thick game-style progress bars with a shine stripe, bigger rounded text boxes, and a bottom tab bar with bold labels and a highlighted active icon.
- Body text keeps the easy-to-read Atkinson Hyperlegible font; the dyslexia option switches headings too. All contrast and accessibility checks still pass.

## Session 5 — Wed Oct 7, 2026 — New look with shadcn/ui

- The whole app now uses **shadcn/ui** components (https://github.com/shadcn-ui/ui): buttons, cards, badges, inputs, switches, toggle chips, tabs, alerts, progress bars and pop-up sheets. The shadcn source files live in `src/components/shadcn/` (and `components.json` lets the shadcn CLI add more later).
- New neutral "zinc" color palette for backgrounds, cards and borders in light and dark mode, keeping Rumbo's teal and orange brand colors.
- Pop-up sheets now use the shadcn/Radix dialog: slide up from the bottom on phones, centered on computers, with focus trapping and Esc to close.
- Kept for students: 44px tap targets, a bigger on/off switch, the easy-to-read Atkinson Hyperlegible font, strong keyboard focus outlines, and form borders with enough contrast to see.
- New automatic check: no page may scroll sideways on a 375px phone.

## Session 4 — Tue Oct 6, 2026 — Phases 9 and 10

### Phase 9 — Motivation and fun
- **Badges** (20) and **this month's challenge** (rotates monthly, e.g. "Volunteer 5 hours this month") on Me → My progress. Badges are calculated from what the student actually did.
- **Avatar editor:** colors, faces, hats and frames unlock as the student levels up.
- **Year in review:** school-year summary (Aug–Jul) of XP, applications, acceptances, hours, plan steps, accomplishments and certificates. Printable and can be read aloud.
- **School volunteer leaderboard:** school totals only — never student names or individual numbers. Two demo schools are sample data.
- **Celebration screen** with confetti when a student marks "Accepted!" or finishes a plan (confetti is off when the device asks for reduced motion).
- **Printable flyers:** any opportunity → a black-and-white flyer in English **and** Spanish with a QR code to the official page.

### Phase 10 — Accessibility and trust (finished)
- **"Delete all my data" now also deletes from the server:** the student's posts, reviews, event check-ins, school activity counts, shared plans and parent links.
- **Privacy page** updated to list exactly what the server keeps (including scrambled device and internet-address codes used for fair-use limits).
- **Vietnamese (beta)** now covers the welcome steps, search and opportunity details; other screens fall back to English.
- More pages saved for offline use (plan details, progress, tracker).

## Session 3 — Fri Oct 2, 2026 — Phases 4, 5, 6 and 7

### Phase 4 — Skill building (finished)
- **Practice tests** in SAT, PSAT, ACT and TSI style with a timer, score, and review of every answer. Scores are saved to Progress.
- **Public speaking coach:** record yourself; Rumbo counts words per minute and filler words ("um", "like", "este", "o sea") and the AI gives 3 tips. Rumbo never uploads the recording — only the words are sent to the AI, and only if the student asks for tips.
- **Free courses** (Khan Academy, Code.org, CS50, etc.) sorted by the student's interests and goals.

### Phase 5 — Life planning
- **Weekly schedule builder** (school, practice, work, study, family, sleep) with an overlap warning.
- **Budget planner** for activity costs with **savings goals** and progress bars.
- **Packing lists** from templates (sports, academic competition, camp, trip, interview, volunteering).

### Phase 6 — People (safe, group-only)
- **No private messages anywhere.** Everything happens in moderated groups.
- **Study rooms** (Algebra, Biology, English, test prep, Computer Science), **Find a team** (post the competition and the skills you need), **Ask a mentor** (only verified mentors with a mentor code can answer), **school group**, **alumni stories** (posted by staff), **club directory**, **parent carpool board** (parent code only; meet at the school).
- **Every post is filtered on the server:** phone numbers, emails, street addresses, links and social media handles are removed automatically; mean, sexual or bullying posts are blocked; a post that sounds like a crisis isn't shared — the student sees help lines instead.
- **Report button** on every post. A post is hidden after reports from 2 different devices. 20 posts per device per day.
- Students must join a school group (code from a teacher) to post. Anyone can read open groups. Under-13s only see People if a parent turns it on.
- **Shared plans:** share a plan with a 6-letter code; friends follow it, copy it, and send **preset cheers only** (no free text).
- **Event buddy:** on any opportunity, tell classmates in your school group "I'm going" — they see your nickname only.

### Phase 7 — Wellbeing
- **Burnout check** that looks at the weekly schedule and deadlines (too many hours, no rest, no sleep, late-night work).
- **Balance meter** (learning / activities / work / recharge), **mood check-in**, **breathing exercise**, **stress tips**, **study-break reminders**, and a link to free, private help lines.

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
