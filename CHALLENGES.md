# Challenges

Technical problems we hit and how we solved them. Useful for the submission video.

## 1. Too many features for the time we had
**Problem:** The full feature list has 10 phases.
**Solution:** Build in phases and keep a working app after every phase. Each phase has to pass the build, the linter, the type checker and all tests before the next one starts.

## 2. Stopping the AI from making up opportunities
**Problem:** AI models can "hallucinate": write things that sound real but aren't. A fake listing could waste a student's time or be unsafe.
**Solution:** Instructions alone aren't enough, so the server checks the AI's work. While the AI searches, we collect every web address the search tool really returned. Then we compare each listing's link to that list (ignoring small differences like `www.` or a trailing slash). If the link isn't there, the listing is deleted and the student sees a note like "I removed 1 result because I couldn't confirm its link was real." There's a unit test with a fake "Nowhere Inc" internship to prove it gets removed (`tests/unit/finder.test.ts`).

## 3. Keeping AI costs low
**Problem:** Every AI web search costs money. A popular app could run up a big bill.
**Solution:** Three layers. (1) A 24-hour cache: the same search near the same place costs $0 the second time. (2) Each device gets a daily limit, and each network gets a bigger one (school Wi-Fi is shared). (3) The server estimates the cost of every AI call from its token counts and stops calling the AI when the daily budget is reached — the app then shows sample results instead of breaking.

## 4. Protecting kids' privacy
**Problem:** Users are 11–18, and some are under 13 (COPPA).
**Solution:** No login, no full names, no addresses. The profile, saved items, plans and chats are stored only in the student's own browser. Students under 13 go through a parent consent screen, and parents can lock features with a PIN (stored only as a scrambled SHA-256 hash). The server never stores raw IP addresses or device IDs — only salted hashes used for rate limits.

## 5. A database that works on free hosting with zero setup
**Problem:** SQLite is easy on a laptop, but free hosts like Vercel can't run database migration steps for it, and we didn't want students or judges to need a database account just to try the app.
**Solution:** A script turns the Prisma schema into `CREATE TABLE IF NOT EXISTS` statements (`scripts/gen-init-sql.mjs`). The first time the server touches the database, it creates any missing tables and adds a demo school. The same schema can switch to Postgres for a permanent database.

## 6. Language flicker and dark-mode flash
**Problem:** The student's language and theme are saved in their browser, so the server doesn't know them. Pages first appeared in English/light mode and then "jumped."
**Solution:** A tiny script runs before the page is drawn and applies the saved theme, font and text size. The app waits until the saved data is loaded before showing content, so the first thing students see is already in their language.

## 7. Safety before AI
**Problem:** If a student types something like "I want to die" into a search box, a normal search result would be the wrong response.
**Solution:** Every search, coach message and plan goal is checked on the server *before* it goes to the AI. Messages about self-harm, abuse or danger (in English and Spanish) immediately show trusted help lines like 988 and Crisis Text Line (text AYUDA to 741741 for Spanish). Tests make sure normal homework like "how do I kill a process in Linux" doesn't trigger it.

## 8. Testing on real phone sizes
**Problem:** It's easy to build something that looks good on a laptop and breaks on a small phone.
**Solution:** Automated Playwright tests open every page at iPhone SE size (375px) and desktop size, in light and dark mode, check there's no sideways scrolling and no errors, run the axe accessibility checker, and save screenshots we review.

## 9. Census website blocked
**Problem:** We planned to download U.S. Census ZIP code coordinates to measure distances, but the download was blocked in our build environment.
**Solution:** We used the open-source `zipcodes` package (BSD license), which contains the same ZIP code coordinates, and only load it on the server so it doesn't slow down phones.

## 10. Making sure chess puzzles are really correct
**Problem:** A wrong puzzle answer would frustrate students and teach the wrong thing.
**Solution:** Every puzzle was checked with the chess.js engine, and a unit test plays every legal move in every puzzle to prove there is exactly one checkmate and that it matches our answer. Students can tap squares or type the move, so the board works with a keyboard and screen readers too.

## 11. Parents without the app
**Problem:** Many parents won't install a new app or make an account, and some read Spanish only.
**Solution:** "Ask a parent" creates a private link (a long random code) that opens a simple page in the student's language with a big Yes / No. It never includes the student's name. The student's app checks the answer automatically.

## 12. Reminders without collecting emails or phone numbers
**Problem:** Email and text reminders would mean storing students' contact info — and texting services need carrier registration that takes weeks.
**Solution:** Rumbo makes a calendar file with two alarms (1 week and 1 day before each deadline). Once added to Google, Apple or Outlook calendar, the student's own phone reminds them — privately — even when Rumbo is closed. In-app and browser notifications cover the rest.

## 13. Keeping student posts safe
**Problem:** Students are minors. Posts and reviews must never share phone numbers, addresses or social media handles.
**Solution:** A server-side filter removes phone numbers, emails, street addresses, links and social handles from every post, review and parent note, and blocks profanity, bullying and sexual content in English and Spanish. Reported posts are hidden after 2 reports until staff review them.

## 14. A "people" tab that is safe for minors
**Problem:** Students wanted to find teammates and study partners, but a social feature for 11–18 year olds can expose them to strangers.
**Solution:** There is no private messaging at all — only groups. Posting needs a school code from a teacher, so every student poster belongs to a real school. Mentors can only answer (not start conversations), and only with a mentor code. Parents only see the carpool board. Personal info is stripped by the server before anything is saved, and cheers on shared plans come from a fixed list so nothing can be hidden in them.

## 15. One person hiding posts by reporting many times
**Problem:** The first version hid a post after 2 reports — but one device could report twice and hide anything. The automatic tests caught this.
**Solution:** Each device can report a post once (stored as a salted hash, not an identity). A post is hidden after reports from 2 different devices.

## 16. Speaking practice without uploading kids' voices
**Problem:** Voice recordings are sensitive.
**Solution:** Rumbo never uploads or saves the recording — it stays on the phone so the student can play it back. Words come from the browser's built-in voice typing (in some browsers, like Chrome, that service runs on the browser maker's servers, the same as any voice typing). Rumbo counts pace and filler words on the phone, and only the words are sent to the AI — and only when the student taps "Get tips".
