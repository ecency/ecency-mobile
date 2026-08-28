---
name: debug
description: Diagnose a bug in the Ecency mobile app when a broadcast or login fails, a wallet or transfer amount is wrong, a screen or deep link does not open, a bottom sheet misbehaves, dark mode colors are wrong, an SDK query returns stale data, or a Metro or native build breaks
argument-hint: [issue-description]
---

# Debug Guide

Triage procedure. Layout, commands, architecture and test setup are in `CLAUDE.md`; this file
adds the per-area entry points plus the traps. Verify against the code before acting.

## 1. Auth / broadcast

`authType` is a **string**, never a number (`src/constants/authType.ts`):
`steemConnect`, `hiveAuth`, `masterKey`, `activeKey`, `memoKey`, `postingKey`, `ownerKey`.
`mapAuthTypeToLoginType` (`src/utils/authMapper.ts`) maps them to the SDK login type:

| `currentAccount.local.authType` | login type |
|---|---|
| `'steemConnect'` | `'hivesigner'` |
| `'hiveAuth'` | `'hiveauth'` |
| the five key types above | `'key'` |
| anything else | `'key'` plus an `[AuthMapper] Unknown authType` warning |

(CLAUDE.md still says `AUTH_TYPE 1/2/5/7`. Those numbers appear nowhere in `src/`.)

Routing is `src/providers/sdk/mobilePlatformAdapter.ts`. `getLoginType(username, authority)`
overrides the map twice: a key user doing an `active` op with `local.activeKey` signs directly;
a key user with no `postingKey` but an `accessToken` goes to HiveSigner. A HiveSigner user asking
for `active` returns `null`, so the SDK falls through to `showAuthUpgradeUI`.

Authority per operation: `resolveOperationAuthority` / `resolveTxRequiredAuthority` in
`src/utils/hiveOperationAuthority.ts`. Posting covers only `vote`, `comment`, `comment_options`,
`custom_json`, `delete_comment`, `claim_reward_balance`; `custom_json` with `required_auths` plus
`account_update2` touching keys or `json_metadata` escalate. Everything else is active.

- **Active key gone right after upgrade**: `setTempActiveKey` expires it after `60_000` ms while
  `getActiveKey` calls `clearTempActiveKey()` on read, so it is single use.
- **HiveSigner WebView not opening**: `broadcastWithHiveSigner` calls
  `RootNavigation.navigate({ name: ROUTES.MODALS.HIVE_SIGNER, ... })`
  (`src/navigation/rootNavigation.tsx`).
- **HiveAuth not responding**: `broadcastWithHiveAuth` delegates to `handleHiveAuthFallback` in
  `src/providers/hive/hive.ts`. CLAUDE.md still points at `src/providers/hive/dhive.ts`; that file
  is gone and nothing imports `hive/dhive`. The fallback dedupes by
  `` `${name}:${operationName}` ``, so a concurrent call reuses the in-flight promise.
- **Auth upgrade sheet not showing**: `showAuthUpgradeUI` loads `SheetManager` plus `SheetNames`
  via `getSheetDeps()`, a cached lazy `require()` deliberately used instead of `import()`
  (which Metro wraps in an async shim), to dodge a circular import. Check that first.
- **"@ecency.app doesn't have permission to broadcast"**:
  `isMissingEcencyPostingAuthorityError` lowercases `error_description` plus `message` then
  matches the substring `permission to broadcast`, or `unauthorized_client` together with an
  `ecency.app` mention; an `ecency.app` mention on its own matches neither branch. A bare
  `unauthorized_client` is an expired token or wrong scope. `shouldPromptPostingAuthority` gates
  the grant sheet.

## 2. Wallet / transfer

Screens `src/screens/transfer/screen/`; hooks `src/providers/queries/walletQueries/`, which
composes SDK options (`getPortfolioQueryOptions`, `getPointsQueryOptions`,
`get{Hive,Hbd,HivePower}AssetTransactionsQueryOptions`, `getOpenOrdersQueryOptions`,
`getRecurrentTransfersQueryOptions`, `getSavingsWithdrawFromQueryOptions`,
`getConversionRequestsQueryOptions`, `getCollateralizedConversionRequestsQueryOptions`).

- Delegations are `getVestingDelegationsQueryOptions(username, limit)` (`delegateScreen.tsx`,
  `src/screens/assetDetails/children/delegationsModal.tsx`). The SDK also exports
  `getHivePowerDelegatingsQueryOptions`, but mobile never uses it (0 hits in `src/`), so do not
  reach for it by name.
- **Shows 0 HP**: `vestsToHp(vests, hivePerMVests)` (`src/utils/conversions.ts`) returns `0` when
  either argument is falsy and runs `parseFloat(String(vests))`, so a raw number and
  `"1000000.000000 VESTS"` both work. Zero almost always means `hivePerMVests` was missing.
- **Stale delegations**: invalidate the exact
  `getVestingDelegationsQueryOptions(name, limit).queryKey`; a different `limit` is another key.
- **`[object Object]`**: RPC rejections are not `Error` instances, so `String(error)` collapses
  them. See `src/components/upvotePopover/container/upvotePopover.tsx`.

## 3. Navigation

`src/navigation/`: `stackNavigator.tsx`, `drawerNavigator.tsx`, `botomTabNavigator.tsx` (spelling
is intentional), `appNavigator.tsx`, plus `rootNavigation.tsx` for non-React navigation.

- **Screen not found**: the route must be in `src/constants/routeNames.ts` *and* registered in one
  of the navigators. `stackNavigator.tsx` holds 36 `<MainStack.Screen>` entries plus 9
  `<RootStack.Screen>` entries for the pre-login and modal routes (`STACK.MAIN`,
  `SCREENS.REGISTER`, `LOGIN`, `WELCOME`, `ACCOUNT_LIST`, `WEB_BROWSER`, `PINCODE`,
  `MODALS.POLL_WIZARD`, `MODALS.HIVE_SIGNER`), so grepping only for `MainStack` wrongly declares
  login, pincode, web browser and the HiveSigner modal unregistered. The remaining routes are the
  5 `<Tab.Screen>` in `botomTabNavigator.tsx` and `<Drawer.Screen name={ROUTES.SCREENS.FEED}>` in
  `drawerNavigator.tsx`.
- **Deep link dead**: `src/hooks/useLinkProcessor.tsx` exports only `handleLink`, which
  dispatches to `_handleEcencyAuthTransferDeeplink`, `_handleEcencyLoginDeeplink`,
  `_handleEcencyTransferDeeplink`, `_handleHiveUri` (which defers to `_handleHiveUriTransaction`)
  or else `_handleDeepLink`. That last one runs `deepLinkParser` then navigates, falling back to
  `ROUTES.SCREENS.WEB_BROWSER` when nothing parses, so an unrecognised link looks like the in-app
  browser opening for no reason. Parsing is `src/utils/deepLinkParser.ts`, which has a co-located
  test to reproduce against.

## 4. Bottom sheets

Registry `src/navigation/sheets.tsx`: the `SheetNames` enum and the `registerSheet` calls are
one-to-one (29 each today).

- **Not opening**: the component must be imported into `sheets.tsx` and registered. It need not
  come from the `src/components/index.tsx` barrel; 7 registered sheets are imported by direct
  path instead, for example `SignConfirmSheet` from `src/screens/dappBrowser/components/`.
- **Stale data**: sheets unmount on hide (CLAUDE.md), so no sheet state survives a close. What a
  sheet renders is the payload captured when `SheetManager.show` ran, so re-show with fresh data.
- **Result is `undefined`**: a sheet resolves with what it passes to
  `SheetManager.hide(sheetId, { payload: value })` (`src/components/authUpgradeSheet/`). A
  backdrop dismiss resolves `undefined`, so a falsy result means dismissed, never confirmed:
  `const ok = await SheetManager.show(SheetNames.SIGN_CONFIRM, { payload }); if (!ok) return;`
- A throw from a sheet render or cleanup is fatal: sheets sit outside the ErrorBoundary.

## 5. Theme

`react-native-extended-stylesheet` is built by the only `EStyleSheet.build` call in the repo,
`EStyleSheet.build(isDarkTheme ? darkTheme : lightTheme)` inside a `useMemo` keyed on
`[isDarkTheme]` (`src/screens/application/hook/useInitApplication.tsx`), so it reruns on every
theme toggle. Stylesheet values therefore re-resolve; only a value read outside a stylesheet stays
stale. For those reads use `EStyleSheet.value('$theme') === 'darkTheme'`.

| Variable | Light | Dark |
|---|---|---|
| `$primaryBackgroundColor` | `#FFFFFF` | `#1e2835` |
| `$primaryLightBackground` | `#f6f6f6` | `#2e3d51` |
| `$primaryBlack` | `#3c4449` | `#fcfcfc` |
| `$primaryDarkText` | `#788187` | `#fcfcfc` |
| `$iconColor` | `#c1c5c7` | `#788187` |

`$primaryGray`, `$primaryLightGray`, `$primaryRed`, `$primaryGreen` are identical in both themes,
so switching to them fixes nothing. Bad dark mode colors usually mean a literal hex.

## 6. SDK queries

Config `src/providers/queries/sdk-config.ts` (`initSdkConfig`), client
`src/providers/queries/index.ts`.

- **No fetch**: check `enabled`; an undefined username silently disables the query.
- **Stale after a mutation**: the adapter's `invalidateQueries` takes a raw key or `{ queryKey }`
  and only warns on failure, so a wrong key looks like success.
- **RPC errors**: `ConfigManager.setHiveNodes(nodes)` runs once from the saved server plus
  `getNodes()`, both filtered by `withoutBlockedServers` / `isBlockedServer`
  (`src/constants/options/api.ts`); `hiveTxConfig.timeout` is 10000 ms. A blocked node is never
  retried, so check the pool before blaming failover.

## 7. Build

```bash
bash patch-gradle.sh                       # required for RN 0.79.5, also runs on install
cd android && ./gradlew clean && cd .. && yarn android
cd ios && pod install && cd .. && yarn ios
yarn start --reset-cache                   # Metro cache only
```

`yarn clear` deletes `node_modules` and reinstalls, so never run it in a shared or worktree
checkout. `yarn typecheck` runs `scripts/typecheck.js`, not bare `tsc`.

## Triage order

1. Reproduce, name the screen or component, find it under `src/screens/` or `src/components/`.
2. Reads: SDK query options to query hook to component.
3. Writes: `useMutationAuth()` to `mobilePlatformAdapter` to HiveSigner / HiveAuth / key.
4. User state: `useAppSelector(selectCurrentAccount)`.
5. Prefer a co-located Jest test over a manual repro; `src/utils/` already has suites.
