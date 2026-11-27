<p align="center">
  <img src="assets/images/icon.png" alt="Jamaat Tracker icon" width="120" />
</p>

# Jamaat Tracker

A small, private, offline-first mobile app for tracking the five daily prayers, with a focus on praying in congregation (ba-jamaat). Built with React Native, Expo and TypeScript.

[![CI](https://github.com/ali-saad-khan/jamaat-tracker-app/actions/workflows/ci.yml/badge.svg)](https://github.com/ali-saad-khan/jamaat-tracker-app/actions/workflows/ci.yml)

## Why this exists

I run a daily WhatsApp poll in a family group to remind everyone to pray in congregation. This app is the personal version: tick each prayer as it happens, see your streak, and get a reminder at prayer time. Your data stays on your phone. Read the [case study](docs/CASE-STUDY.md).

## Features

- **Check-in:** mark each prayer as _with congregation_, _alone_ or _missed_. Tap to change, long-press to clear.
- **History:** a month calendar coloured by how many prayers were in congregation; tap any past day to correct it.
- **Stats:** current and best streak (you choose whether a day needs 3, 4 or 5 congregation prayers), a 7-day chart, week and 30-day summaries.
- **Prayer times:** from the free [Aladhan](https://aladhan.com/prayer-times-api) API for your city, calculation method and Asr school (Hanafi or Shafi), cached for offline use.
- **Reminders:** local notifications at prayer time or 5, 10 or 15 minutes before.
- **English and Urdu** with right-to-left layout, and a system, light or dark theme.
- **Private:** no account, no tracking, no server. All data is stored on the device.

## Tech

React Native · Expo SDK 58 (Expo Router) · TypeScript (strict) · SQLite (`expo-sqlite`) · `expo-notifications` · Jest (`jest-expo`, `better-sqlite3` for real SQL tests) · GitHub Actions · EAS Build.

## Run it

You need Node 22.13 or newer and the Expo Go app on a phone on the same Wi-Fi.

```bash
nvm use
npm install
npx expo start      # scan the QR code with Expo Go
```

More in [docs/SETUP.md](docs/SETUP.md). To build an installable Android app see [docs/RELEASE.md](docs/RELEASE.md).

## Quality checks

```bash
npm run format:check && npm run lint && npm run typecheck && npm test
```

72 tests cover the date, streak, stats and reminder logic (including daylight-saving days and month and year ends), the Aladhan parsing and caching, and the SQL layer against a real in-memory SQLite database. CI runs the same checks on every push and pull request.

## How it is organised

```
src/app/        screens and layouts (Expo Router), kept thin
src/domain/     pure TypeScript: dates, statuses, streaks, stats, reminder planning
src/data/       SQLite access, migrations, settings, prayer-time cache
src/services/   Aladhan client, notification scheduling
src/state/      settings, prayer times and i18n providers
src/i18n/       English and Urdu strings
src/ui/         shared components and theme
tests/          Jest tests mirroring src/
docs/           plan, decisions, progress, phase notes, release guide
```

## Documentation

| Doc                                      | What it covers                                           |
| ---------------------------------------- | -------------------------------------------------------- |
| [docs/PLAN.md](docs/PLAN.md)             | Scope, architecture, data model and the phased roadmap   |
| [docs/DECISIONS.md](docs/DECISIONS.md)   | Why each technical choice was made                       |
| [docs/PROGRESS.md](docs/PROGRESS.md)     | Dated log of what was built and what is still to confirm |
| [docs/phases/](docs/phases)              | Design and task list for each phase                      |
| [docs/RELEASE.md](docs/RELEASE.md)       | Building the APK and publishing a release                |
| [docs/CASE-STUDY.md](docs/CASE-STUDY.md) | The story, decisions and lessons                         |

## Status

Phases 0 to 4 are complete and merged. Phase 5 (release) is prepared: the installable APK, screenshots and a few on-device checks (background reminders, Urdu layout, TalkBack) are the remaining steps. See [docs/PROGRESS.md](docs/PROGRESS.md).

## License

MIT
