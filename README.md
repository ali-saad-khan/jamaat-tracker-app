# Jamaat Tracker

A small, offline-first mobile app for tracking the five daily prayers, with a focus on praying in congregation (ba-jamaat). Built with React Native, Expo and TypeScript.

> **Status:** planning complete, Phase 0 (foundation) in progress. See [docs/PROGRESS.md](docs/PROGRESS.md).

## Why this exists

I run a daily WhatsApp poll in a family group to remind everyone to pray in congregation. This app is the personal version: tick each prayer as it happens, see your streak, and get a reminder at prayer time. Your data stays on your phone.

## Planned features

- Check in each of the five prayers as **with congregation**, **alone** or **missed**.
- Current streak, weekly and monthly stats.
- Prayer-time reminders from the free [Aladhan](https://aladhan.com/prayer-times-api) API, cached for offline use.
- English and Urdu, including right-to-left layout.
- Dark mode, accessible touch targets, no account and no tracking.

## Tech

React Native · Expo (Router) · TypeScript · SQLite (`expo-sqlite`) · Jest · GitHub Actions · EAS Build.

## Documentation

| Doc | What it covers |
|---|---|
| [docs/PLAN.md](docs/PLAN.md) | Scope, architecture, data model and the phased roadmap |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Why each technical choice was made |
| [docs/PROGRESS.md](docs/PROGRESS.md) | Dated log of what is done and what is next |

## Roadmap at a glance

| Phase | Goal |
|---|---|
| 0 | Foundation: project, tooling, CI |
| 1 | Core check-in with local storage |
| 2 | Prayer times and reminders |
| 3 | Streaks and stats |
| 4 | Urdu / RTL, dark mode, accessibility, polish |
| 5 | Release: APK, screenshots, case study |
| 6 | Optional: Laravel sync API |

## License

MIT
