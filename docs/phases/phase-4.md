# Phase 4: Language, theme and polish

Roadmap entry: [../PLAN.md](../PLAN.md). Decisions D15 to D18 are in [../DECISIONS.md](../DECISIONS.md).

## Goal

Make the app comfortable for Urdu readers and in the dark, and give it a finished look.

## What was done

1. [x] Typed English and Urdu dictionary, with a test for matching keys and placeholders.
2. [x] Language setting; reminders are worded in the chosen language.
3. [x] Right-to-left layout through the root `direction` style.
4. [x] Light and dark palettes and a System / Light / Dark setting.
5. [x] Accessibility: roles, labels, 48 dp touch targets, live regions, hidden decorative icons.
6. [x] App icon, adaptive icon, splash and notification icon.
7. [ ] Manual device pass: Urdu RTL, dark mode, TalkBack.

## Manual checklist

- Switch to Urdu in Settings: every screen is right-to-left, nothing is cut off, month and weekday names are Urdu.
- Switch to Dark: backgrounds, text, cards and the tab bar are readable; the status bar icons are light.
- TalkBack on: each prayer row reads "name: status. Tap to change."; the calendar days read their counts.
- Install the build and check the icon on the home screen and the splash colour.

## Known limits

- Dates are shown with Western digits in both languages.
- Dates are shown as `YYYY-MM-DD` with Western digits in both languages.
