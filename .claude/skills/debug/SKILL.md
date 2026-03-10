---
name: debug
description: Debug common issues in the Ecency mobile app with known solutions and investigation patterns
argument-hint: [issue-description]
disable-model-invocation: true
---

# Debug Guide

Investigate and fix issues in the Ecency mobile app. Start by identifying the category.

## Issue Categories

### 1. Authentication / Broadcast Failures

**Auth methods**: key (direct), hivesigner (OAuth WebView), hiveauth (keychain app)

**Investigation**:
1. Check which auth method: look at `currentAccount.local.authType` — values: 1 (posting key), 2 (active key), 5 (HiveSigner), 7 (HiveAuth)
2. Check `src/providers/sdk/mobilePlatformAdapter.ts` — all auth routing happens here
3. Check authority level: posting vs active — see operation type

**Known issues**:
- **HiveSigner WebView not opening**: Check `broadcastWithHiveSigner` in mobilePlatformAdapter.ts — uses `RootNavigation.navigate` to HIVE_SIGNER modal
- **HiveAuth keychain not responding**: Check `broadcastWithHiveAuth` → `handleHiveAuthFallback` in dhive.ts
- **Auth upgrade sheet not showing**: `showAuthUpgradeUI` uses lazy-loaded SheetManager — check circular import issues
- **Active key not found after upgrade**: Temp active key expires after 60 seconds (`_tempActiveKeyTimer` in mobilePlatformAdapter.ts)
- **"Missing required posting authority"**: HiveSigner token expired or user revoked posting authority for ecency.app

**Auth type mapping** (`src/utils/authMapper.ts`):
```
AUTH_TYPE 1 (posting key) → 'key'
AUTH_TYPE 2 (active key)  → 'key'
AUTH_TYPE 5 (HiveSigner)  → 'hivesigner'
AUTH_TYPE 7 (HiveAuth)    → 'hiveauth'
```

### 2. Wallet / Transfer Issues

**Investigation**:
1. Transfer screens: `src/screens/transfer/screen/` (transferScreen, delegateScreen, etc.)
2. Wallet queries: `src/providers/queries/walletQueries/`
3. SDK wallet queries: `@ecency/sdk` — `getVestingDelegationsQueryOptions`, `getHivePowerDelegatingsQueryOptions`, etc.

**Known issues**:
- **Amount validation inconsistent**: Check that _all_ code paths validate both minimum AND maximum (available balance)
- **Vesting shares format**: `vestsToHp()` expects string like "123.456789 VESTS" — don't pass raw numbers
- **Stale delegation data**: After delegating, invalidate the vesting delegations query cache
- **"[object Object]" error messages**: Error objects need `.message` extraction before display

### 3. Navigation Issues

**Stack**: React Navigation v6 with nested navigators
- Stack: `src/navigation/stackNavigator.tsx`
- Drawer: `src/navigation/drawerNavigator.tsx`
- Bottom tabs: `src/navigation/botomTabNavigator.tsx`
- Root navigation (non-React): `src/navigation/rootNavigation.ts`

**Known issues**:
- **Screen not found**: Check route is in `src/constants/routeNames.ts` AND registered in stackNavigator
- **Params not updating**: React Navigation caches screen params — use `route.params` not stale state
- **Deep link not working**: Check `src/hooks/useLinkProcessor.tsx` for URL scheme handling

### 4. Sheet (Bottom Sheet) Issues

**System**: `react-native-actions-sheet`
**Registry**: `src/navigation/sheets.tsx`

**Known issues**:
- **Sheet shows stale data**: Sheets stay mounted — state persists between show/hide cycles. Add `useEffect(() => { reset() }, [payload])` to reset state
- **Sheet not opening**: Check it's registered in `sheets.tsx` AND exported from `src/components/index.tsx`
- **Return value is undefined**: Backdrop tap returns undefined. Always handle: `const result = await SheetManager.show(...); if (!result) return;`

### 5. Styling / Theme Issues

**System**: `react-native-extended-stylesheet`
**Themes**: `src/themes/lightTheme.ts`, `src/themes/darkTheme.ts`

**Known issues**:
- **Colors wrong in dark mode**: Using hardcoded colors instead of `$primaryBackgroundColor`, `$primaryBlack`, etc.
- **Theme not applied**: EStyleSheet variables are set at app startup. If a color doesn't change with theme, check it uses a `$variable`

**Key theme variables**:
| Variable | Light | Dark |
|---|---|---|
| `$primaryBackgroundColor` | `#FFFFFF` | `#1E2835` |
| `$primaryBlack` | `#3c4449` | `#F5F5F5` |
| `$primaryLightBackground` | `#f6f6f6` | `#131e29` |
| `$iconColor` | `#788187` | `#F5F5F5` |

### 6. SDK Query Issues

**Investigation**:
1. SDK config: `src/providers/queries/sdk-config.ts`
2. Query client: `src/providers/queries/index.ts`
3. SDK queries used in: `src/providers/queries/` and directly in screens

**Known issues**:
- **Query not fetching**: Check `enabled` flag — undefined params cause silent no-fetch
- **Stale data after mutation**: Mutation should invalidate relevant queries via `invalidateQueries` in adapter
- **RPC node errors**: SDK handles failover automatically via `ConfigManager.setHiveNodes()`

### 7. Build Issues

**Android**:
```bash
# Gradle patch required for RN 0.79.5
bash patch-gradle.sh

# Clean build
cd android && ./gradlew clean && cd ..
yarn android
```

**iOS**:
```bash
# Reinstall pods
cd ios && pod install && cd ..
yarn ios
```

**Metro bundler**:
```bash
# Full cache clear
yarn clear
# Or just reset Metro cache
yarn start --reset-cache
```

## General Investigation Steps

1. **Reproduce**: Identify exact steps and which screen/component is affected
2. **Find the code**: Screens in `src/screens/`, components in `src/components/`
3. **Check the data layer**: SDK query → query hook → component
4. **Check auth flow**: mobilePlatformAdapter → SDK broadcast → HiveSigner/HiveAuth/key signing
5. **Check Redux**: `useAppSelector(selectCurrentAccount)` for user state
6. **Check logs**: Reactotron for network + state, `console.log` for quick debugging

## Useful Commands

```bash
yarn lint              # Check for lint errors
yarn lint:fix          # Auto-fix lint issues
yarn start --reset-cache  # Clear Metro cache
adb reverse tcp:9090 tcp:9090  # Reactotron Android
```
