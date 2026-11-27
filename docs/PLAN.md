# Plan

## 1. Goal

Ship a small but complete mobile app that shows full-stack developers also understand mobile: local storage, notifications, an external API, right-to-left text, tests, CI and a built release. It should be finished in a handful of focused sessions, cost nothing to build, and be genuinely useful to its author.

## 2. Scope

**In scope (v1)**

- Daily check-in for Fajr, Dhuhr, Asr, Maghrib and Isha: _with congregation_, _alone_, _missed_ or _not marked yet_.
- Streaks, weekly and monthly statistics, a history view.
- Prayer times for a chosen city (Aladhan API) and local notifications.
- English and Urdu (RTL), dark mode.
- All data stored on the device.

**Out of scope (v1)**

- Accounts, cloud sync, social features, analytics.
- Qibla compass, Quran, adhan audio.
- iOS App Store / Play Store publishing (an Android APK in GitHub Releases is enough).

## 3. Principles

1. **Offline first.** Everything except fetching prayer times works with no network, and prayer times are cached.
2. **Private by default.** No accounts, no analytics, no data leaves the phone.
3. **Small phases.** Every phase ends with something runnable, tested and documented.
4. **Logic separate from UI.** Date, streak and status rules are plain TypeScript with unit tests.
5. **Document as we go.** Each phase updates `docs/PROGRESS.md` and, where a choice was made, `docs/DECISIONS.md`.

## 4. Architecture

```
src/
  app/               Expo Router screens and layouts (thin, UI only)
  domain/            Pure TypeScript: prayers, statuses, dates, streaks, stats
  data/              SQLite access (repositories) and migrations
  services/          Aladhan client, notification scheduling, settings
  i18n/              Strings (en, ur) and RTL helpers
  ui/                Reusable components and theme tokens
tests/               Jest tests, mirroring src/ (domain first)
docs/                Plan, decisions, progress, setup
```

Flow: screen -> hook -> repository/service -> SQLite or API. Screens never contain business rules.

## 5. Data model (local SQLite)

| Table                | Columns                                                                                                                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entries`            | `date` (YYYY-MM-DD, local day), `prayer` (`fajr` `dhuhr` `asr` `maghrib` `isha`), `status` (`jamaat` `alone` `missed`), `updated_at`. Primary key (`date`, `prayer`). A missing row means "not marked yet". |
| `settings`           | `key`, `value` (city, country, calculation method, language, theme, reminders on/off)                                                                                                                       |
| `prayer_times_cache` | `date`, `city`, `fajr` ... `isha` (HH:mm), `fetched_at`                                                                                                                                                     |

Dates are stored as local calendar days, never UTC timestamps, so the "day" matches the user's day.

## 6. Phases

Each phase is one branch and one pull request into `main`.

### Phase 0: Foundation

**Deliverables:** Expo + TypeScript project with Expo Router, ESLint and Prettier, Jest, folder structure from section 4, GitHub Actions (lint, type-check, test), README and docs.
**Done when:** the app opens on a real phone, `npm test` and CI are green.

### Phase 1: Core check-in (local)

**Deliverables:** domain types and date helpers, SQLite setup with migrations, repository for entries, Today screen with five prayer rows, tap to cycle status, a simple History list.
**Tests:** status cycling, local-day boundaries, repository read/write.
**Done when:** marks survive closing and reopening the app.

### Phase 2: Prayer times and reminders

**Deliverables:** onboarding to pick a city, Aladhan client with caching, times shown on Today, local notifications scheduled per prayer, permission handling, reminders toggle.
**Tests:** API response parsing, cache fallback, notification scheduling logic (with fakes).
**Done when:** a reminder fires at a prayer time on the phone, and the app still shows cached times in airplane mode.

### Phase 3: Streaks and stats

**Deliverables:** streak and best-streak calculation, weekly and monthly summary (congregation rate, prayers marked), a simple bar chart, calendar-style history.
**Tests:** streak rules including gaps, today-not-yet-complete, month boundaries and timezone/DST edges.
**Done when:** numbers match a hand-checked sample dataset.

### Phase 4: Language, theme and polish

**Deliverables:** English and Urdu strings, RTL layout, dark mode, accessibility labels and large touch targets, empty and error states, app icon and splash screen.
**Done when:** the whole app is usable in Urdu RTL and dark mode, and passes a manual screen-reader pass.

### Phase 5: Release

**Deliverables:** EAS Build Android APK, GitHub Release with the APK, screenshots and a short screen recording, finished README, a portfolio case study.
**Done when:** a friend can install the APK from the release page and use it.

### Phase 6 (optional): Sync

**Deliverables:** small Laravel API (login, push/pull entries), conflict rule (latest `updated_at` wins), export/import JSON as the offline alternative.
**Done when:** two devices show the same history.

## 7. Definition of done (every phase)

- Code merged to `main` through a pull request.
- Lint, type-check and tests pass in CI.
- `docs/PROGRESS.md` updated; `docs/DECISIONS.md` updated if a choice was made.
- Manually checked on a real device.

## 8. Risks and mitigations

| Risk                                          | Mitigation                                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Aladhan unavailable or rate limited           | Cache a month of times; fall back to the last known times and say so in the UI                  |
| Notification limits and OS battery rules      | Schedule a rolling window (for example 7 days), reschedule on app open, document the limitation |
| Android has no local emulator on this machine | Test on a physical phone with Expo Go; use EAS cloud builds for release                         |
| Time zones and DST                            | Store local calendar dates, keep all date logic in one tested module                            |
| Scope creep                                   | Anything outside section 2 goes to Phase 6 or a "later" list in PROGRESS                        |

## 9. Open questions

- Streak rule: all five in congregation, or at least a chosen number? (Decide in Phase 3; default all five.)
- Should a missed prayer be editable after the day ends? (Default yes.)
- Prayer-time calculation method default (Karachi method for the author; configurable).
