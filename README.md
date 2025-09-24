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

## Ecency deep link schemes

Ecency exposes custom URL schemes so third-party apps, mobile websites, and in-app browsers can hand transactions or credential requests to the Ecency mobile app. The handler lives inside the shared link processor hook, so the flows described below are identical on Android and iOS.【F:src/hooks/useLinkProcessor.tsx†L28-L442】

### `ecency://login`

Open `ecency://login?username=<user>&callback=<url>` to ask Ecency to share the currently stored posting key for `<user>` via the callback URL. `redirect_uri` and `return_url` are accepted as aliases for `callback`, and you may include an opaque `request_id` to help correlate responses. `:src/hooks/useLinkProcessor.tsx:L305-L346` Ecency validates that the account is logged in on the device and that the user has a posting key stored locally; otherwise it immediately invokes the callback with `status=error`, a machine-readable `error` code, and a human-friendly `message`. `[:src/hooks/useLinkProcessor.tsx:L337-L410]`

When the prerequisites are met Ecency prompts the person to confirm that they want to share their posting key with the requesting application. If they approve and Ecency can decrypt the key using the configured/user set PIN, the callback URL is opened with `status=success`, the normalized `username`, and the decrypted `posting_key`. Declining the prompt or failing to unlock the key results in a `status=error` payload instead. `[:src/hooks/useLinkProcessor.tsx:L281-L418]` The original `request_id` value, when present, is appended to the callback so integrators can match asynchronous responses. `[:src/hooks/useLinkProcessor.tsx:L233-L258]`

### `ecency://transfer`

The `ecency://transfer` endpoint prepares Ecency Point transfers inside the app. Supported query parameters are:

- `to` – recipient account (leading `@` is optional)
- `from` – optional sender account; defaults to the currently logged-in account
- `asset` – `HIVE`, `HBD`, or `POINTS`
- `amount` – numeric amount; Ecency rounds to three decimals before signing
- `memo` – optional memo text
- `callback` – optional URL to be opened after signing
- `request_id` – optional correlation token returned to the callback

Ecency parses the deep link, converts it into a Hive URI operation (`transfer` or `custom_json` with `id=ecency_point_transfer`), and then feeds the resulting `hive://` URI to the generic signing flow. Invalid parameters or account mismatches trigger the callback with `status=error` and an explanatory error code before the request is rejected in-app.`[:src/hooks/useLinkProcessor.tsx:L172-L218]` Successful signatures open the callback with `status=success` (and the broadcast transaction id when available), while failures surface `status=error` to the caller. `[:src/hooks/useLinkProcessor.tsx:L495-L588]`

### `hive://…` and `ecency://sign/…`

Ecency understands standard Hive URI transactions generated by the [`hive-uri`](https://github.com/ecency/hive-uri) package. Both `hive://` links and the Ecency-specific alias `ecency://sign/...` are accepted; the latter is normalized to the former before processing.【F:src/utils/hive-uri.ts†L11-L24】 The app requires the user to be logged in and, if necessary, unlock their PIN before it decodes the URI, verifies that exactly one operation is present, and confirms that the local account has the requested authority keys available. `[:src/hooks/useLinkProcessor.tsx:L444-L599]` `[:src/utils/hive-uri.ts:L75-L140]`

During confirmation Ecency replaces the placeholder `__signer` values with the active account name, including inside Ecency Point transfer payloads, so integrators can omit the signer from the original URI. After the user approves, Ecency signs and broadcasts the transaction, then opens any `callback` URL provided in the Hive URI (or in the options passed down from `ecency://transfer`) with `status=success` and the transaction id. Cancellations and failures produce `status=error` responses instead, and any supplied `request_id` is echoed back so clients can reconcile responses.【F:src/hooks/useLinkProcessor.tsx†L495-L588】

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
