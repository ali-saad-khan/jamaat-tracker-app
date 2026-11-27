# Phase 2: Prayer times and reminders

Detailed design and task list. The roadmap entry is in [../PLAN.md](../PLAN.md). Written against Expo SDK 58 docs and the live Aladhan API (both checked on 2026-11-27).

## Goal

Show today's five prayer times for the user's city on the Today screen and remind them at each prayer time, with times cached so the app keeps working offline.

## Facts checked before designing

**Aladhan API** (free, no key, limit 12 requests per second)

- `GET /v1/calendarByCity/{year}/{month}?city=&country=&method=&school=` returns a whole month in one call. The Karachi December 2026 call returned 31 days.
- Times arrive as `"05:39 (PKT)"`, so the zone suffix must be stripped before use. Dates arrive as `DD-MM-YYYY`.
- An unknown city returns HTTP 400 with `"Unable to geocode address"`. That is the "city not found" case.
- The **school** parameter changes Asr by a lot: Karachi on 27 Nov 2026 is **15:22** (Shafi, `school=0`) or **16:06** (Hanafi, `school=1`). It must be a visible setting. Default for this app's author: Hanafi.
- Calculation methods are numbered; Karachi is `1`, ISNA `2`, MWL `3`, Makkah `4`, Egypt `5`. A short fixed list is enough, so the app does not depend on the methods endpoint.

**Expo notifications (SDK 58)**

- Remote push is unavailable in Expo Go on Android, but **local notifications still work**. This app only uses local ones.
- Scheduling uses `scheduleNotificationAsync` with a date trigger (`SchedulableTriggerInputTypes.DATE`). `cancelAllScheduledNotificationsAsync` and `getAllScheduledNotificationsAsync` exist for rescheduling and tests.
- Android needs a notification **channel** before the permission prompt appears (`setNotificationChannelAsync`).
- Exact-time delivery on Android needs the `SCHEDULE_EXACT_ALARM` permission, which Android 14 and later deny by default. Default delivery is best-effort, so a reminder can arrive a little late.

## Design

### Settings (`settings` table, already exists)

`city`, `country`, `method` (default `1`), `school` (default `1`), `remindersEnabled` (default off until permission is granted), `reminderOffsetMinutes` (0, 5, 10 or 15; default 0).

Changing city, method or school clears the times cache and reschedules.

### Prayer times cache (migration v2)

`prayer_times(date TEXT, location_key TEXT, fajr, dhuhr, asr, maghrib, isha TEXT, fetched_at INTEGER, PRIMARY KEY(date, location_key))` where `location_key` is `city|country|method|school`. Times are `HH:mm`.

### Aladhan client (`src/services/aladhan.ts`)

- `fetchMonth(settings, year, month)` returns parsed, validated days or a typed error (`city_not_found`, `network`, `bad_response`).
- A pure `parseMonth(json)` strips the `(PKT)` suffix, converts `DD-MM-YYYY` to `YYYY-MM-DD`, and rejects any day missing a prayer.
- `ensureTimes(db, settings, today)` makes sure the cache covers today plus 7 days, fetching the current and next month only when needed.

### Reminder planning (`src/domain/reminders.ts`, pure)

`planReminders(times, now, offsetMinutes, windowDays)` returns the list of `{ id, at, prayer, title, body }` for prayers still in the future inside a rolling window. IDs look like `prayer-2026-11-27-fajr`. No Expo imports, so it is fully unit-tested.

### Scheduler (`src/services/reminders.ts`, thin)

Cancels everything, then schedules the plan. Runs on app start, when the app returns to the foreground, and when settings change. A small wrapper interface lets tests use a fake.

### Time zones

Times are interpreted in the phone's local zone. If the phone is in a different zone from the saved city, times can be wrong; this is a known limitation for v1, stored in DECISIONS and shown as a note on the settings screen. (The API returns the city's zone, so a later phase can convert properly.)

### Screens

- **Onboarding / Settings:** city, country, method and school pickers, a "Test it" button that fetches today's times and shows them, and the reminders toggle with the permission explanation.
- **Today:** a time under each prayer name; a note when times come from the cache or are stale; a clear message when no times are available.
- A "Not available yet" state still lets the user mark prayers (Phase 1 works without times).

## Tasks

1. Migration v2 and cache repository, with tests.
2. `parseMonth` and the Aladhan client with a fake `fetch`, tests for suffix stripping, date conversion, errors and bad data.
3. `ensureTimes` cache logic with tests (cold cache, warm cache, month rollover, offline fallback).
4. `planReminders` with tests (offsets, past times skipped, window edges, midnight, ID stability).
5. Reminder scheduler wrapper and Android channel setup, with a fake in tests.
6. Settings screen and first-run flow.
7. Show times on Today with cache and error states.
8. Manual device check, docs and progress update, pull request.

## Test plan

- **Unit (Jest):** parsing, cache decisions, reminder planning, scheduler calls against a fake.
- **Manual (phone, Expo Go):** pick a city and see times; wrong city shows the error; schedule a reminder two minutes ahead and see it fire; airplane mode still shows cached times; change `school` and watch Asr move.
- **Deferred to Phase 5 (installable build):** reminders after the app is closed for hours, after a phone restart, and under battery saver. Expo Go cannot prove these.

## Done when

- Today shows correct times for the chosen city, including offline from the cache.
- A reminder fires on the phone at (or very close to) the prayer time.
- Lint, type-check and tests pass in CI; PROGRESS and DECISIONS updated.

## Risks

| Risk                                         | Mitigation                                                                                     |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Aladhan unreachable or limits requests       | Cache a month, fetch rarely, show last known times with a clear note                           |
| Late or dropped reminders from battery rules | Reschedule on every app open; document limits; add the exact-alarm option in Phase 5 if needed |
| Wrong Asr for the user's school              | Visible `school` setting with a sensible default; shown in onboarding                          |
| City name ambiguity                          | Ask for city and country; show the resolved times so the user can confirm                      |
| Phone and city in different zones            | Documented limitation for v1                                                                   |

## Open choices (decide while building)

- Whether `reminderOffsetMinutes` ships in v1 or is cut to keep the settings screen small. Default plan: ship it, it is one setting.
- Whether to show the Hijri date. Default plan: no, out of scope.
