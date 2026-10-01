# Pathfinder — Project Plan

**Status:** Draft for review. No code has been written yet.
**Competition:** 2026 Congressional App Challenge. Deadline: Monday, Oct 26, 2026, 12:00 PM ET.
**Planned on:** Thursday, Oct 1, 2026. That leaves **25 days**, and the video still needs recording time.

---

## 1. Time check

There's a lot in the full feature list. Phases 3 to 10 alone would take a small team months. With 25 days, here's my estimate:

| Scope | Realistic? |
|---|---|
| Foundation + all of **Phase 1**, polished | Yes. This is the main goal. |
| A **focused slice of Phase 2** | Yes, if Phase 1 is finished by about Oct 16 |
| Phases 3–10 | Mostly **"future plans"** for the video. A few small items are already needed for Phase 1 (see §4). |

### Calendar

| Dates | Milestone | What you'll have at the end |
|---|---|---|
| Thu Oct 1 – Sun Oct 4 | **M0: Foundation** | App shell with the 5 tabs, EN/ES toggle, light/dark mode, accessibility settings, installable PWA, onboarding + age check, privacy page, demo data. Runs with **no API key** (demo mode). |
| Mon Oct 5 – Fri Oct 9 | **M1: Finder + Profile** | Real AI web search, opportunity cards, filters, Save, "not a confirmed listing" suggestions with email/phone scripts, scam flags, profile. |
| Sat Oct 10 – Mon Oct 12 | **M2: Coach + Plan** | Coach chat with Homework / Mock Interview / Debate / Quiz modes. Plan builder with templates, checklist, progress bar, AI adjustments, linked opportunities. |
| Tue Oct 13 – Thu Oct 15 | **M3: Safety + polish** | Safety review, voice input, read aloud, low data mode, offline saved items, testing on every page at phone size, deployed to a public URL. |
| **Fri Oct 16** | **Phase 1 checkpoint** | You test it on your phone and approve it before Phase 2 starts. |
| Sat Oct 17 – Wed Oct 21 | **M4: Phase 2 slice** | See §5. |
| **Thu Oct 22** | **Code freeze** | Bug fixes only after this date. |
| Fri Oct 23 – Sun Oct 25 | **Video + submission** | Record, edit, write the submission. **Submit Sunday Oct 25** so there's a full day of buffer. |

---

## 2. Tech decisions (with reasons)

| Area | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript + Tailwind CSS** | Your request. Pages and the server API live in one project. |
| Where student data lives | **On the student's own device first** (IndexedDB via Dexie) | Profile, saved items, plans, and chats stay on the phone. That means no login, almost no personal data on a server (good for COPPA), and offline mode almost for free. It also makes a strong point for the video: *"Your data stays on your phone."* |
| Server database | **Prisma ORM**: **SQLite** on your computer, **Postgres (Supabase free tier)** once deployed | SQLite needs no setup, so you can run it right away. Prisma lets the same schema switch to Supabase Postgres with a one-line change. SQLite files can't be saved on Vercel, so the deployed app needs Postgres. |
| What the server stores | Search cache, rate-limit counters, demo opportunities. Phase 2 adds parent-approval links and staff posts. | Only what *must* be shared or protected. |
| AI | **Anthropic TypeScript SDK** with the **web search tool**. Calls run only in server API routes. | The key stays in `.env.local` on the server and is never sent to the browser. |
| AI model | Set in one environment variable (`AI_MODEL`) | You choose how to balance cost and quality. See §7. |
| Output safety | AI returns **structured JSON**, which is checked with **Zod** | Malformed results are rejected instead of shown. |
| i18n | **next-intl**, with one file per language: `messages/en.json`, `messages/es.json` | Adding a language means adding one file and one line in the config. |
| PWA / offline | **Serwist** (`@serwist/next`) service worker + web manifest | Installable on phones. Pages and saved data work offline. |
| Voice | Browser **Web Speech API** for speech-to-text, **speechSynthesis** for read aloud | Free, no extra API cost. The mic button is hidden on browsers that don't support it. |
| Location | Browser geolocation, **or** a ZIP/city typed in. A bundled public-domain **Census ZIP-code centroid file** turns a ZIP into coordinates for distance. | No paid maps API. The exact location never leaves the device; only a rounded area goes to the AI. |
| Rate limiting | Counters in the database table, per device and per hashed IP, **plus a global daily dollar cap** | Works on serverless hosting. If the cap is hit, the app falls back to cached results and demo data instead of breaking. |
| Hosting | **Vercel** (free), connected to the GitHub repo | Gives the HTTPS URL a PWA needs to install, and a link judges can open. |
| Testing | **Playwright** at a phone size (iPhone SE 375px and Pixel 7), plus `axe` accessibility checks | Covers "test every page on a phone sized screen." |

### How "the AI must never invent listings" is enforced (code, not just a prompt)

This is one of the strongest technical stories for the video.

1. The AI is told to return only listings it found through web search, each with a `sourceUrl`.
2. **The server checks every `sourceUrl` against the URLs the web search tool actually returned in that same request.** A URL the search never saw can't be a real result, so that listing is **removed**.
3. Any detail the AI leaves blank (cost, dates, ages) appears as **"Not listed, check with organizer"**. The AI is told never to guess.
4. Places that *might* offer an opportunity are a separate result type, `suggestion`. They always carry the label **"Not a confirmed listing. Contact them first to ask."** and include a sample email and phone script.

### Keeping AI costs low

- **Cache searches for 24 hours.** The cache key is the normalized query + rounded location + grade band + language, so a repeated search costs $0.
- **Per-device daily limits.** Starting values are 15 searches and 60 coach messages per day, set in `.env`.
- **Global daily budget cap**, for example $3/day. The server estimates the cost of each call from the token counts and stops calling the AI once the cap is reached.
- **Low-effort settings** for chat. The number of web searches per request is capped (`max_uses`).
- Also set a **monthly spend limit in the Anthropic Console** as a second safety net.

---

## 3. Phase 1 scope (exactly what gets built)

### 0. Foundation
- Bottom tab bar on phones: **Find · Coach · Plan · People · Me**. It becomes a side bar on desktop.
- Header on every page with an **EN/ES toggle** and a quick-settings button.
- Settings: **light/dark/system theme**, **dyslexia-friendly font** (OpenDyslexic), **large text**, **low data mode**, language.
- Accessibility basics: skip link, visible focus rings, ARIA labels, contrast at WCAG AA or better, everything reachable by keyboard, `prefers-reduced-motion` respected.
- **Low data mode** turns off images and animations, loads fewer results, and makes no automatic AI calls.
- **Demo mode:** with no API key, the app runs on sample RGV demo data, so it always looks complete. Demo items are labeled "Sample".

### 1.1 Opportunity Finder (home)
- Greeting: *"What are you looking for today?"*, with a text box, a mic button, and example chips ("chess tournaments", "paid summer jobs", "free coding camps").
- Location: "Use my location" (asks permission) or type a ZIP/city. Online-only results always included.
- Results cards: title, organization, description, category, cost/"Free", grade/age, dates, deadline, location/"Online", distance, "No car needed?" (yes / no / unknown), source link, one-line **"Why this fits you"**, and a **Save** button.
- 12 categories, exactly as listed in your spec.
- Filters: category, Free/Paid, grade, distance, online/in person, deadline, paid-opportunities-only. **"Free only" is a large toggle at the top.**
- Fee waivers and scholarships are shown as a badge when the source mentions them.
- **Suggestions** section, used when there are few or no confirmed listings, with copyable sample **email** and **phone script** (in both languages).
- **Scam check** on every result. The AI flags warning signs, and a server-side keyword check adds a second layer: upfront fees for "guaranteed" jobs, requests for SSN or bank info, gift cards, pressure tactics, and so on. Flagged cards show a ⚠️ warning with an explanation.

### 1.2 AI Coach
- Streaming chat with mode chips: **Ask anything · Homework (teaches step by step) · Mock interview · Debate opponent · Quiz me**.
- Homework mode uses Socratic prompts: guiding questions, hints, and checking the student's work. It doesn't hand over final answers.
- The coach knows the profile (grade, interests, goals) so the student doesn't repeat details.

### 1.3 Plan Builder
- Inputs: goal, grade, hours per week.
- The AI generates **weekly / monthly / yearly milestones**, shown as a checklist with a progress bar.
- **"Ask AI to adjust"** box, for example "I only have 3 hours now" or "add summer camps".
- **Linked opportunities:** each plan suggests saved items or Finder searches that fit the goal.
- **Templates** (bilingual and pre-written, so they cost $0 and work offline): Eagle Scout, State chess, First job, Apply to college, Medical school path, Make varsity, Win a debate tournament, Learn to code.

### 1.4 Profile (Me)
- Grade, school (optional), interests, skills, goals, preferred language, transportation ("I can get rides" / "I need bus or walking").
- **No full name is ever asked for.** A nickname is optional and stays on the device.
- "My Saved" list with statuses: Saved → Applied → Accepted.

### 1.5 Safety basics
- **Plain-language privacy page** in EN and ES.
- **Age check during onboarding.** The student gives their birth year, not their full birthday. If they're **under 13**, a **parent consent screen** must be completed with a parent present: the parent reads a short bilingual summary and agrees. *Honest note:* full COPPA "verifiable parental consent" usually involves stronger checks, such as email confirmation. The Phase 1 version shows the principle, and a stronger version is listed for Phase 2/10.
- **AI safety:** the system prompt + Claude's built-in safeguards refuse inappropriate requests. If a message mentions self-harm, abuse, or danger, the app shows trusted help **immediately** (988 Suicide & Crisis Lifeline, which offers Spanish; Childhelp 1-800-422-4453; "talk to your school counselor") and does not continue with normal coaching.
- **Age filter:** results whose minimum age is above the student's age are hidden, and blocked topics (gambling, 18+/21+ venues, dating, etc.) are filtered out.

---

## 4. Small items I recommend pulling forward into Phase 1

You asked for strict phase order. These later-phase items are either **required for Phase 1 to work** or take **under an hour each**, so I suggest including them:

| Item | Where it's from | Why now |
|---|---|---|
| Voice input | 10.1 | Phase 1.1 already says students can "speak" their search |
| Read aloud | 10.2 | Uses a free built-in browser feature, and it's a strong accessibility point |
| Offline saved items & plans | 10.3 | Required by the PWA requirement in the tech stack |
| Download / delete my data | 10.6 | Data is on the device, so this is one button each. Good for privacy judging. |
| "How the AI works" transparency page | 10.7 | Supports the "never invent listings" story |
| **People tab:** "Coming soon" page explaining the safety design | 6 | The tab must exist in the nav. A clear "how we'll keep it safe" page beats an empty tab. |

---

## 5. Phase 2: recommended slice (Oct 17–21)

Ranked by **value ÷ effort**. Items lower on the list are likely to become future plans.

| # | Feature | Plan | Effort |
|---|---|---|---|
| 1 | **2.2 Accomplishments, volunteer hours, certificates, progress dashboard** | Full version, stored on the device | Low |
| 2 | **2.3 Deadline calendar + in-app reminders + conflict checker** | Full version. **Google Calendar sync → simpler version:** "Add to calendar" `.ics` download, which works with Google, Apple, and Outlook. | Low–Med |
| 3 | **2.4 Application help** | Email/statement helper, essay feedback, and interview practice for a saved opportunity become **new Coach modes** that reuse the existing chat. **Resume → PDF** through a print-friendly page ("Save as PDF"). | Low–Med |
| 4 | **2.1 Parent view + parent approval** | **Simpler version:** "Share with my parent" creates a **private link** with a bilingual summary (dates, costs, places) and **Yes / No** buttons. No parent account needed. | Medium |
| 5 | **2.1 Verified counselor/teacher posts** | **Simpler version:** staff sign up with a **school code**. Posts wait in an admin approval queue (you approve them for the demo), then appear in search with a **Verified** badge. | Med–High |
| — | Teacher dashboard, counselor reports | **Future plans.** These need real staff accounts, student-teacher linking, and privacy review. | High |
| — | Email/SMS reminders | **Future plans.** SMS requires carrier registration (A2P 10DLC) that can take weeks. Email requires collecting student emails. | High |

---

## 6. Phases 3–10: "Future plans" for the video

If we finish early, I'd pick these **quick wins** in this order: Surprise me (3.1.2), Seasonal suggestions (3.1.5), Search history rerun (3.1.7), Celebration screen (9.7), Printable flyer (9.8), Online-only mode (3.1.6). Everything else (map, career explorer, FAFSA helper, practice tests, People/social features, wellbeing, XP/badges, etc.) goes into the video as the roadmap.

**Phase 6 (People) note:** social features for minors need moderation, verification, and reporting before anything goes live. Even in a later version, I'd launch Phase 6 with only **moderated, school-code-gated group spaces** and no free-text posting until filtering is tested.

---

## 7. Decisions I need from you

1. **App name.** Suggestions, chosen to work in both English and Spanish:
   1. **Rumbo** (Spanish for "direction / course": *"¿Cuál es tu rumbo?"*). This is my top pick.
   2. **Faro** ("lighthouse": a light that guides you)
   3. **Sendero** ("trail / path")
   4. **AbrePuertas** ("opens doors"). Bilingual tagline: *"Opening doors in the Valley."*
   5. **ValleUp** (Valley + level up; mixes English and Spanish the way the RGV does)
2. **AI model (cost vs. quality).** One finder search does several web searches (search pricing is about **$10 per 1,000 searches**; check Anthropic's pricing page) and reads a lot of web text. Rough estimates per finder search, *to be measured once built*:

   | Model | Price (input / output per 1M tokens) | Est. per finder search | Notes |
   |---|---|---|---|
   | `claude-opus-5-5` | $4 / $20 | ~$0.15–0.30 | Most capable, best at following the "never invent" rules |
   | `claude-sonnet-5-5` | $2 / $10 | ~$0.08–0.15 | Good balance |
   | `claude-haiku-4-5` | $1 / $5 | ~$0.04–0.08 | Cheapest. Uses the older basic web search tool. |

   The model is one line in `.env`, so you can change it anytime. For example, you could use Opus 5.5 for the Finder and a cheaper model for the Coach.
3. **Data on the device (recommended) vs. student accounts.** Data on the device means no login and better privacy, but data doesn't sync between devices until a future "backup code" feature.
4. **What you need to set up:** an **Anthropic API key** with a spending limit, a free **Vercel** account, and a free **Supabase** project (needed only once we deploy, around Oct 13–15). I'll give step-by-step instructions when we get there.
5. **Competition rules check.** Please read the **2026 Congressional App Challenge rules on AI coding tools and disclosure** to confirm how AI-assisted code must be credited. `CHANGELOG.md`, `CHALLENGES.md`, and the code comments will help you explain every part of the app in your own words.

---

## 8. Folder structure

```
app/
├── messages/                    # Translations. Add a language = add a file here.
│   ├── en.json
│   └── es.json
├── prisma/
│   ├── schema.prisma            # Server database tables (see §9)
│   └── seed.ts                  # Loads demo opportunities
├── public/
│   ├── icons/                   # App icons for phone home screens
│   └── fonts/                   # OpenDyslexic (dyslexia-friendly font)
├── src/
│   ├── app/                     # Pages (each folder = a URL)
│   │   ├── layout.tsx           # Shared frame: header, tab bar, theme, language
│   │   ├── page.tsx             # "/" → Find
│   │   ├── find/page.tsx        # 1.1 Opportunity Finder (home)
│   │   ├── coach/page.tsx       # 1.2 AI Coach
│   │   ├── plan/                # 1.3 Plan Builder (list, new, [id])
│   │   ├── people/page.tsx      # Phase 6 preview (safety design)
│   │   ├── me/                  # 1.4 Profile, saved, settings, my data
│   │   ├── welcome/             # Onboarding, age check, parent consent
│   │   ├── privacy/page.tsx     # 1.5 Plain-language privacy page
│   │   ├── how-ai-works/page.tsx# 10.7 Transparency page
│   │   ├── offline/page.tsx     # Shown when there's no internet
│   │   ├── sw.ts                # Service worker (offline + install)
│   │   ├── manifest.ts          # PWA manifest
│   │   └── api/                 # SERVER ONLY — the API key lives here
│   │       ├── search/route.ts  # Finder → Claude + web search
│   │       ├── coach/route.ts   # Coach chat (streaming)
│   │       └── plan/route.ts    # Create / adjust plans
│   ├── components/
│   │   ├── ui/                  # Buttons, cards, toggles, chips (reusable)
│   │   ├── layout/              # TabBar, Header, LanguageToggle, SettingsSheet
│   │   ├── finder/              # OpportunityCard, Filters, SuggestionCard, ScamWarning
│   │   ├── coach/               # ChatWindow, ModePicker, MessageBubble
│   │   ├── plan/                # Milestone checklist, ProgressBar, TemplatePicker
│   │   └── a11y/                # VoiceInputButton, ReadAloudButton
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts        # Creates the Anthropic client (server only)
│   │   │   ├── prompts/         # System prompts for finder, coach, plan, safety
│   │   │   ├── finder.ts        # Search + "source URL must be real" check
│   │   │   ├── coach.ts
│   │   │   └── plan.ts
│   │   ├── safety/
│   │   │   ├── scam-check.ts    # Second-layer scam keyword rules
│   │   │   ├── age-filter.ts    # Hides results not right for the student's age
│   │   │   └── crisis.ts        # Detects serious issues → trusted help
│   │   ├── ratelimit.ts         # Daily limits + global budget cap
│   │   ├── cache.ts             # 24h search cache
│   │   ├── geo.ts               # ZIP → coordinates, distance in miles
│   │   ├── db.ts                # Server database (Prisma)
│   │   ├── local-db.ts          # On-device database (Dexie/IndexedDB)
│   │   └── schemas.ts           # Zod shapes for Opportunity, Plan, etc.
│   ├── data/
│   │   ├── demo-opportunities.ts# Realistic RGV sample data (labeled "Sample")
│   │   ├── goal-templates.ts    # Ready-made bilingual plans
│   │   └── tx-zip-centroids.json# Public Census data for distance
│   └── i18n/                    # Language config + loader
├── tests/                       # Playwright phone-size + accessibility tests
├── docs/PROJECT_PLAN.md         # This file
├── CHANGELOG.md                 # What was built each session
├── CHALLENGES.md                # Problems we hit + how we solved them
├── .env.example                 # Lists needed keys (no real secrets)
└── README.md                    # How to install, run, and test
```

---

## 9. Database design

### A. On the student's device (IndexedDB, via Dexie). Personal data lives here.

| Table | Fields | Notes |
|---|---|---|
| `profile` (1 row) | `deviceId` (random), `nickname?`, `birthYear`, `grade`, `school?`, `zip?`, `interests[]`, `skills[]`, `goals[]`, `language`, `transport` (`car` / `rides` / `bus_walk`), `settings` {theme, dyslexiaFont, largeText, lowData}, `consent` {under13, parentConsentAt?} | No full name, no address, no email. |
| `saved` | `id`, `opportunity` (full snapshot so it works offline), `status` (`saved` / `applied` / `accepted`), `notes`, `savedAt` | |
| `plans` | `id`, `goal`, `grade`, `hoursPerWeek`, `templateId?`, `createdAt`, `milestones[]` {id, title, horizon (`week` / `month` / `year`), due?, done, linkedOpportunityIds[], searchSuggestion?} | Progress % = done ÷ total |
| `chats` | `id`, `mode`, `messages[]` {role, text, at}, `updatedAt` | Keeps only the last 20 chats |
| *Phase 2:* `accomplishments`, `volunteerHours`, `certificates`, `reminders` | | |

### B. On the server (Prisma: SQLite locally, Postgres deployed). Shared or protective data only.

```prisma
model Opportunity {          // Demo items, cached search results, (Phase 2) staff posts
  id            String   @id @default(cuid())
  title         String
  organization  String
  description   String
  category      String   // job | internship | academic_competition | sports_competition | event |
                         // volunteer | club | scholarship | summer_program | camp | course | certification
  costType      String   // free | paid | unknown
  costText      String?
  feeWaiver     String?
  isPaidWork    Boolean  @default(false)
  minGrade      Int?
  maxGrade      Int?
  minAge        Int?
  startDate     DateTime?
  endDate       DateTime?
  deadline      DateTime?
  isOnline      Boolean  @default(false)
  locationText  String?
  lat           Float?
  lng           Float?
  carFree       String   @default("unknown") // yes | no | unknown
  sourceUrl     String?
  sourceType    String   // web | demo | staff
  verified      Boolean  @default(false)     // true only for approved staff posts
  scamFlags     String?  // JSON list of warnings
  language      String   @default("en")
  createdAt     DateTime @default(now())
}

model SearchCache {          // Saves money: same search within 24h costs $0
  id         String   @id @default(cuid())
  cacheKey   String   @unique // hash(normalized query + rounded location + grade band + language)
  resultJson String
  createdAt  DateTime @default(now())
  expiresAt  DateTime
}

model UsageEvent {           // Rate limits + daily budget cap
  id          String   @id @default(cuid())
  clientHash  String   // hashed device ID + IP (never the raw IP)
  route       String   // search | coach | plan
  inputTokens Int
  outputTokens Int
  searches    Int      @default(0)
  costCents   Float
  createdAt   DateTime @default(now())
  @@index([clientHash, route, createdAt])
}

// ---- Phase 2 (only if we get there) ----
model ParentShare {          // "Share with my parent" link + yes/no approval
  id          String   @id @default(cuid())
  token       String   @unique // long random string in the private link
  summaryJson String   // what the parent sees (no student name)
  decision    String?  // approved | declined
  expiresAt   DateTime
  createdAt   DateTime @default(now())
}

model School    { id String @id @default(cuid()); name String; joinCode String @unique }
model StaffPost { id String @id @default(cuid()); schoolId String; opportunityId String;
                  staffEmailHash String; status String /* pending|approved|rejected */; createdAt DateTime @default(now()) }
```

---

## 10. How each phase is "done"

A phase counts as finished only when **all** of these are true:
- [ ] Every page works at **375px wide** (small phone), checked with Playwright screenshots
- [ ] Every page works in **English and Spanish**, with no untranslated text
- [ ] **Light and dark** mode both pass contrast checks (automated `axe` test)
- [ ] Every feature works with the **keyboard only**
- [ ] The app works in **demo mode with no API key**
- [ ] `npm run lint`, `npm run typecheck`, and `npm test` pass
- [ ] `CHANGELOG.md` and `CHALLENGES.md` are updated
- [ ] I've written you a **"How to run & test"** + **"What's not working yet"** summary
