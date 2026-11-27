# Decisions

Short records of choices, so the reasoning is not lost. Newest last.

## D1: React Native with Expo and TypeScript

**Why:** matches the React and TypeScript skills already used on the web, fastest route to a real device (Expo Go), and EAS Build gives cloud Android builds without installing the Android SDK. **Trade-off:** less control over native code than a bare React Native or Flutter project; acceptable for this app.

## D2: Expo Router for navigation

**Why:** file-based routes, the current Expo default, familiar to Next.js users.

## D3: Local SQLite (`expo-sqlite`) instead of a backend

**Why:** the data is small, personal and relational (date x prayer), and the app must work offline. No accounts also means no privacy burden. **Trade-off:** no multi-device sync until the optional Phase 6.

## D4: Store local calendar dates, not timestamps

**Why:** "today" must mean the user's day. UTC timestamps put late-night prayers on the wrong date near midnight and across DST changes.

## D5: Domain logic in plain TypeScript

**Why:** streaks and date rules are the riskiest code. Keeping them free of React and native modules lets them be tested quickly with Jest.

## D6: Aladhan API for prayer times

**Why:** free, no key, supports many calculation methods including Karachi. Responses are cached so the app does not depend on it at runtime.

## D7: One branch and one pull request per phase

**Why:** keeps history readable, shows the working process on GitHub, and gives CI a clear gate.

## D8: Test SQL with `better-sqlite3` in memory

**Why:** the repository code is mostly SQL (upserts, ranges), so mocking it would prove little. `better-sqlite3` installs cleanly on Node 22 and gives a real SQLite engine behind the app's small `Db` interface. **Trade-off:** it is a native dev dependency; if it breaks on a future Node version, `sql.js` is the fallback.

## D9: Plain text tabs for now

**Why:** the SDK 58 template dropped the vector-icon package and `expo-symbols` is iOS only. Text-only tabs keep dependencies small; icons can come in Phase 4 polish with an accessible choice.
