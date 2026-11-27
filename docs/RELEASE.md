# Release guide

## How 1.0.0 was built (local, without EAS)

The first release was built on a laptop with the Android SDK instead of EAS, so no Expo account was needed.

1. Install the Android command-line tools and the packages the project needs (platform 37, build-tools 37.0.0, NDK 27.1.12297006, CMake 3.22.1).
2. In a scratch copy of the repo: `npm ci`, then `npx expo prebuild --platform android`.
3. Sign the release build with your own key (a keystore generated once with `keytool`) by adding a `release` signing config to `android/app/build.gradle`.
4. Build: `cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,x86_64` (about 26 minutes the first time).
5. Check: `apksigner verify --print-certs app-release.apk`, install it in an emulator and walk through the app.

Keep the keystore and its passwords backed up somewhere safe: updates to an installed app must be signed with the same key. The generated `android/` folder is not committed.

The APK contains arm64-v8a and x86_64 code (modern phones and emulators). Old 32-bit phones are not supported; add `armeabi-v7a` to the architectures to include them.

How to build the Android app and publish it on GitHub. Building needs an Expo account (free).

## One-time setup

```bash
nvm use                      # Node 22
npm install
npx eas-cli login            # your Expo account
npx eas-cli build:configure  # only if eas.json is missing
```

## Build an installable APK (for GitHub Releases and friends)

```bash
npx eas-cli build --platform android --profile preview
```

EAS builds in the cloud and prints a download link when it finishes. The first build asks to generate an Android keystore: accept, and let EAS store it.

## Publish on GitHub

1. Download the `.apk` from the EAS link.
2. Bump the version in `app.json` (`version`) and add a section to `CHANGELOG.md`.
3. Tag and publish:
   ```bash
   git tag v1.0.0 && git push origin v1.0.0
   gh release create v1.0.0 jamaat-tracker-1.0.0.apk --title "Jamaat Tracker 1.0.0" --notes-file CHANGELOG.md
   ```
4. Add the install steps to the README ("download the APK, allow installs from this source, open it").

## Checks on the installed build (cannot be proven in Expo Go)

- [ ] A reminder fires at the right time after the app has been closed for an hour.
- [ ] Reminders still fire after restarting the phone, then opening the app once.
- [ ] Reminders under battery saver. If they arrive late, consider the exact-alarm permission (see D12).
- [ ] The icon, adaptive icon and splash look right on the home screen.
- [ ] Urdu RTL, dark mode and TalkBack (checklist in [phases/phase-4.md](phases/phase-4.md)).

## Screenshots for the README

Take them on the phone (Today, History, Stats, Settings, one in Urdu, one in dark mode), save them in `docs/screenshots/` and add a gallery to the README.

## Play Store (optional, later)

Use `--profile production` to build an `.aab`. Publishing needs a Google Play developer account (one-time fee).
