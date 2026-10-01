# Challenges

Technical problems we hit and how we solved them. Useful for the submission video.

## 1. Too many features for 25 days
**Problem:** The full feature list has 10 phases. There are 25 days until the Oct 26 deadline.
**Solution:** Build in phases. Each phase must be fully working and polished before the next one starts. Phase 1 gets most of the time. The big Phase 2 features get simpler versions (for example, an "Add to calendar" file instead of Google Calendar sync). Phases 3–10 become the "future plans" part of the video.

## 2. How do we stop the AI from making up opportunities? (designed, not built yet)
**Problem:** AI models can sometimes "hallucinate": write things that sound real but aren't. A fake listing could waste a student's time or be unsafe.
**Solution:** Instructions alone aren't enough, so the server checks the AI's work. Every result's source link must be one of the web pages the search tool actually returned in that same request. If it isn't, the result is removed. Missing details show "Not listed, check with organizer" instead of a guess.

## 3. Keeping AI costs low (designed, not built yet)
**Problem:** Every AI web search costs money, and a popular app could run up a big bill.
**Solution:** Repeat searches come from a 24-hour cache for free. Each device gets a daily limit. A global daily budget cap switches the app to cached and demo results instead of spending more.

## 4. Protecting kids' privacy (designed, not built yet)
**Problem:** Users are 11–18, and some are under 13 (COPPA).
**Solution:** No login, no full names, no addresses. The profile, saved items, and plans are stored only on the student's own phone. Students under 13 go through a parent consent screen. The server never stores raw IP addresses, only scrambled (hashed) versions used for rate limiting.
