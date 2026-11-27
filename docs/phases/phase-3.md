# Phase 3: Streaks and stats

Roadmap entry: [../PLAN.md](../PLAN.md). Rules and trade-offs are recorded as D13 and D14 in [../DECISIONS.md](../DECISIONS.md).

## Goal

Show how consistent the user has been: current and best streak, a 7-day chart, week and 30-day summaries, and a calendar history where any past day can be corrected.

## Rules

- A day **qualifies** when at least N prayers were in congregation (N = 5, 4 or 3; default 5).
- **Current streak:** qualifying days in a row ending today. If today does not qualify yet, count back from yesterday, so an unfinished day never resets the streak.
- **Best streak:** the longest run from the first marked day to today.
- **Congregation percentage:** congregation prayers divided by all prayers possible in the range (5 per day), rounded to a whole percent. Unmarked prayers count as not prayed in congregation.

## Tasks

1. [x] Calendar helpers (`monthGrid`, `addMonths`, `weekdayIndex`, `daysInMonth`) with tests.
2. [x] `stats.ts` with tests (gaps, month and year ends, target changes, empty data).
3. [x] `getEarliestDate` repository call with a test.
4. [x] Streak target setting.
5. [x] Stats screen with the 7-day bar chart.
6. [x] History month calendar with day editor.
7. [ ] Manual device check.

## Done when

Numbers match a hand-checked set of days on the phone, and editing a past day updates the calendar, streaks and stats.
