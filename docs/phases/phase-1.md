# Phase 1: Core check-in (local)

Detailed design and task list. The roadmap entry is in [../PLAN.md](../PLAN.md).

## Goal

Mark each of the five prayers for today as _with congregation_, _alone_ or _missed_, see recent days, and have the marks survive closing the app. No network, no notifications yet.

## Design

### Dates (`src/domain/dates.ts`)

- A day is a **local calendar date string** `YYYY-MM-DD` (decision D4).
- `toDateKey(date)`, `addDays(key, n)`, `isValidDateKey(key)`, `lastNDays(today, n)`.
- The current time is passed in (a `now` argument or a small `clock`), never read inside pure functions, so tests can pin it.

### Status cycle (`src/domain/status.ts`)

- Tap cycles: not marked -> `jamaat` -> `alone` -> `missed` -> not marked.
- `summarizeDay(entries)` returns counts: marked, jamaat, alone, missed.

### Storage (`src/data/`)

- `expo-sqlite` (SDK 58): `SQLiteProvider` with an `onInit` migration that reads `PRAGMA user_version` and applies versioned steps, as in the SDK docs.
- **Migration v1:** `entries(date TEXT, prayer TEXT, status TEXT, updated_at INTEGER, PRIMARY KEY(date, prayer))` and `settings(key TEXT PRIMARY KEY, value TEXT)`.
- Repository functions take a small `Db` interface (`runAsync`, `getAllAsync`, `getFirstAsync`) so tests can supply a fake or an in-memory engine:
  - `setStatus(db, date, prayer, status | null)`: upsert, or delete when `null`.
  - `getDay(db, date)`: map of prayer to status.
  - `getRange(db, fromDate, toDate)`: rows for the history view.

### Screens (`src/app/`)

- Tab layout: **Today** and **History**.
- **Today:** local date header, five rows (name, current status, tap to cycle, long-press to clear), a summary line such as "3 of 5 marked, 2 in congregation".
- **History:** last 14 days, one row per day with five status dots and the day's summary.
- A hook refreshes "today" when the app returns to the foreground and when the local date changes.

## Tasks

1. `dates.ts` with tests (month ends, year ends, leap day, DST change days).
2. `status.ts` with tests (full cycle, summary counts).
3. DB provider and migration v1; test that migration is idempotent.
4. Repository functions with tests (upsert, clear, range, unknown values ignored).
5. Today screen wired to the repository.
6. History screen.
7. Day-rollover handling (foreground refresh and midnight timer).
8. Manual device check, docs and progress update, pull request.

## Test plan

- **Unit (Jest):** dates, status cycle, summaries, repository against a fake `Db`.
- **Open choice:** test the SQL itself with an in-memory engine (`better-sqlite3` if it installs cleanly on Node 22, otherwise `sql.js`). Record the result in DECISIONS as D8.
- **Manual (phone):** mark prayers, force-close the app, reopen; change the phone's date to tomorrow and confirm a fresh Today; airplane mode.

## Done when

- Marks persist across app restarts on the phone.
- Today rolls over correctly at local midnight.
- Lint, type-check and tests pass in CI.
- PROGRESS and DECISIONS updated.

## Risks

- **Day rollover while the app is open:** handled by the foreground and midnight refresh, covered by a manual check.
- **Time zone change (travel):** past entries keep their stored dates; only "today" moves.
- **Database initialisation failure:** show a clear error screen and log the cause instead of a blank app.
