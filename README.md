# Ecency Mobile

[![iOS](https://github.com/ecency/ecency-mobile/actions/workflows/build-ios.yml/badge.svg)](https://github.com/ecency/ecency-mobile/actions/workflows/build-ios.yml)
[![Android](https://github.com/ecency/ecency-mobile/actions/workflows/build-android.yml/badge.svg)](https://github.com/ecency/ecency-mobile/actions/workflows/build-android.yml)

Ecency is a React Native client for the [Hive](https://hive.io) blockchain available for iOS and Android devices.

## Beta builds

Try the latest development builds:

- [Android beta](https://play.google.com/apps/testing/app.esteem.mobile.android)

## Download

Stable releases are distributed via the stores:

- App Store iOS: https://ios.ecency.com
- Play Store Android: https://android.ecency.com

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Yarn](https://yarnpkg.com/) package manager
- Xcode (iOS) and/or Android SDK tooling

## Getting started

```bash
git clone https://github.com/ecency/ecency-mobile.git
cd ecency-mobile
yarn
```

Start Metro bundler:

```bash
yarn start
```

### Run on iOS

```bash
yarn ios
```

### Run on Android

1. Create a Firebase project and add an Android app with package name `app.esteem.mobile.android`.
2. Place the generated `google-services.json` into `android/app/`.
3. Start an emulator or connect a device.
4. Execute:
   ```bash
   yarn android
   ```

Installing dependencies will automatically run Gradle patch script required by React Native 0.79. If you hit Gradle errors after upgrading dependencies, run `bash patch-gradle.sh` to reapply the patch.

## Project structure

The repository follows the typical React Native layout:

- `src/` – application source (components, screens, navigation, redux, etc.)
- `android/` – native Android project
- `ios/` – native iOS project
- `resources/` – static assets
- `__tests__/` – Jest tests
- `patches/` – patch-package files applied during install

## Development tips

- **Reactotron** can be used for logging and inspecting network requests.
  - [Install Reactotron](https://github.com/infinitered/reactotron/blob/master/docs/installing.md) and start the desktop app.
  - For Android run `adb reverse tcp:9090 tcp:9090` then restart the app; iOS connects automatically.
- Run linters with `yarn lint` and tests with `yarn jest`.

## Contributing

We welcome community contributions! To get started:

1. Browse [open issues](https://github.com/ecency/ecency-mobile/issues) and assign one to yourself.
2. Create a feature or bugfix branch (e.g. `feature/my-change` or `bugfix/my-fix`).
3. Commit your work and open a pull request. Include relevant issue numbers in commit/PR messages.
4. Request a review from [@feruzm](https://github.com/feruzm) or [@noumantahir](https://github.com/noumantahir).

Security issues should be reported privately to [security@ecency.com](mailto:security@ecency.com).

## Sponsors and collaborators

- Hive community
- React Native community
- Sentry
