# Case study: Jamaat Tracker

A private, offline-first mobile app for tracking the five daily prayers, with a focus on praying in congregation. React Native, Expo, TypeScript, SQLite.

## The problem

I run a daily WhatsApp poll for a family group asking who prayed in congregation. It works as a reminder but leaves nothing for the individual: no personal record, no streak, no prayer-time reminder. I wanted a private version that lives on my phone, and I wanted a real project to show that a full-stack developer can ship mobile too.

## Constraints I set

- **No accounts, no tracking, no backend.** The data is personal.
- **Works offline.** Only the prayer-time download needs a network, and its result is cached.
- **Free to build and run.** Free API, no servers.
- **Small phases.** Each phase ends with something tested and runnable.

## What I built

- **Daily check-in:** five prayers, three statuses, one tap to cycle.
- **History and stats:** month calendar with past-day editing, current and best streak, 7-day chart.
- **Prayer times and reminders:** Aladhan API, cached by city, method and Asr school; local notifications on a rolling window.
- **Urdu and English with right-to-left layout, and a dark theme.**

## Decisions worth explaining

- **Logic first.** Dates, streaks and reminder planning are plain TypeScript with unit tests, separate from React and Expo. 72 tests cover them, including daylight-saving days and month and year ends, run under four time zones.
- **Real SQL in tests.** The repository code is tested against an in-memory SQLite engine behind a small `Db` interface, not a mock.
- **Local calendar days, not timestamps.** "Today" has to mean the user's day, including near midnight.
- **Asr school is a setting.** I checked the API: in Karachi the Asr time differs by 44 minutes between schools, so hiding it would have shipped wrong times for half the users.
- **Right-to-left without a restart.** The `direction` style flips the layout immediately, and on the release build the tab bar order reverses too.
- **Phased delivery with pull requests.** Six phases, each a branch and PR with CI (format, lint, type-check, tests).

## What went wrong or surprised me

- The lint tooling for the current Expo SDK needs Node 22.13 or newer, which I only found when CI-style checks failed on Node 20.
- A lint rule from the React compiler rejected setting state from an effect, which pushed the times provider into a cleaner shape.
- Expo changes quickly between SDKs, so I read the docs for the installed version before each API (SQLite, notifications, router) instead of relying on memory.

## What I would do next

- Confirm background reminder reliability on an installed build, and add the exact-alarm option if needed.
- Convert times by the city's time zone when the phone is somewhere else.
- Optional sync between devices through a small Laravel API with JSON export and import as the offline fallback.

## Links

- Source: https://github.com/ali-saad-khan/jamaat-tracker-app
- Plan, decisions and progress log: `docs/`
