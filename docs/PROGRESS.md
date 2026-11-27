# Progress

Newest first. Each entry says what changed, what was verified, and what is next.

## Status board

| Phase                        | State       |
| ---------------------------- | ----------- |
| 0 Foundation                 | Not started |
| 1 Core check-in              | Not started |
| 2 Prayer times and reminders | Not started |
| 3 Streaks and stats          | Not started |
| 4 Language, theme, polish    | Not started |
| 5 Release                    | Not started |
| 6 Sync (optional)            | Not started |

## Log

### Phase 1: Core check-in

- **Logic (tested):** `dates.ts` (local day keys, DST-safe `addDays`, midnight timer), `status.ts` (tap cycle, day summary).
- **Storage:** `expo-sqlite` with a versioned migration (`PRAGMA user_version`) and a repository (`setStatus`, `getDay`, `getRange`). SQL is tested against a real in-memory SQLite (decision D8).
- **Screens:** Today (tap to cycle, long-press to clear, summary line) and History (last 14 days with five status dots) in a tab layout. Today rolls over at local midnight and when the app returns to the foreground. An error boundary shows database failures instead of a blank screen.
- **Verified:** 23 Jest tests (date tests also run in four time zones), type-check, lint, format, and the Android bundle builds.
- **Still to confirm on the phone:** marks survive closing the app; rollover at midnight (change the phone date); airplane mode.
- **Next:** Phase 2 (prayer times and reminders).

### Phase 0: Foundation

- Scaffolded Expo SDK 58 with Expo Router and TypeScript (strict). Renamed to Jamaat Tracker (`com.saadalikhan.jamaattracker`), removed the template demo screens.
- Added Jest (`jest-expo`), ESLint (`eslint-config-expo`), Prettier, `.nvmrc` (Node 22) and a GitHub Actions workflow that runs format, lint, type-check and tests.
- Created the first domain module (`src/domain/prayers.ts`) with a test, and a placeholder home screen that imports it through the `@/` alias.
- **Verified locally:** format, lint, type-check, 2 tests and `expo-doctor` (20/20) all pass on Node 22.
- **Found:** the Expo lint tooling needs Node 22.13 or newer, so Node 20 is not enough. The plan and CI now use Node 22.
- **Still to confirm:** the app opening on a real phone through Expo Go (needs the author's device).
- **Next:** Phase 1 (core check-in with SQLite). The detailed design and task list are in [phases/phase-1.md](phases/phase-1.md).

### Planning

- Chose the idea, the stack and the phase breakdown. See [PLAN.md](PLAN.md) and [DECISIONS.md](DECISIONS.md).
- **Next:** Phase 0 (project scaffold, tooling, CI).
