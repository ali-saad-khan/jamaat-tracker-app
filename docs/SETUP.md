# Setup

## Requirements

- Node.js **22.13 or newer** (the Expo lint tooling requires it). The repo has an `.nvmrc`; with nvm run `nvm use`.
- npm 10 or newer.
- A phone with the **Expo Go** app (Android or iOS) on the same Wi-Fi network as your computer. No Android emulator is needed.

## Run the app

```bash
nvm use            # picks Node 22 from .nvmrc
npm install
npx expo start     # scan the QR code with Expo Go
```

If the phone cannot reach the computer, try `npx expo start --tunnel`.

## Quality checks

```bash
npm run format:check   # Prettier
npm run lint           # ESLint (eslint-config-expo)
npm run typecheck      # tsc --noEmit
npm test               # Jest (jest-expo preset)
npx expo-doctor        # dependency and config health
```

The same checks run in GitHub Actions on every push to `main` and every pull request.

## Adding dependencies

Always use `npx expo install <package>` so Expo picks versions compatible with the installed SDK. Plain `npm install <package>` can pull an incompatible version.

## Expo version note

Expo changes between SDK releases. Before using an Expo or React Native API, read the docs for the installed SDK (currently 58): https://docs.expo.dev/versions/v58.0.0/ and the index at https://docs.expo.dev/llms.txt.
