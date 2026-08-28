---
name: add-feature
description: Use when adding a new screen, route, or user-facing feature to the Ecency mobile React Native app, covering navigator registration, route params, i18n strings and styling.
argument-hint: [feature-name]
---

# Add Feature

Ordered procedure for adding a screen. Redux, TanStack Query, `@ecency/sdk`, sheets and lint rules
are covered in CLAUDE.md and not repeated. Two steps are easy to miss and each one breaks something:
the safe-area root (Step 1) and the params contract (Step 4).

New screens are functional. Only 12 of the 142 `.tsx` files under `src/screens/` are classes: 11
legacy holdouts, plus `application/children/errorBoundary.tsx`, which React requires to be a class.
A dismissible overlay is a bottom sheet instead: `src/navigation/sheets.tsx`, see CLAUDE.md.

```text
src/screens/<feature>/
  index.ts                     # local barrel, re-exported from src/screens/index.ts
  screen/<feature>Screen.tsx
  screen/<feature>Styles.ts    # or <feature>.styles.ts; 8 .tsx files inline EStyleSheet.create
  children/  hooks/            # optional
```

## Step 1: screen rooted in SafeAreaView

Root must be `SafeAreaView` from `react-native-safe-area-context`: 40 files under `src/screens/`
import it from there. The one file that still takes `SafeAreaView` from `react-native` is
`src/screens/dappBrowser/screen/dappBrowser.tsx`, which is the pattern this rule exists to replace.
Do not pass `edges`: it **replaces** the defaults rather than extending them, so
`edges={['bottom']}` drops the top inset and the header runs under the status bar. That shipped on
Email digests; the fix to that screen in PR #3531 was the single-line deletion of
`edges={['bottom']}`.

Skeleton for `screen/<feature>Screen.tsx` (a template, not a quote of any one file):

```tsx
import React from 'react';
import { useIntl } from 'react-intl';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BasicHeader } from '../../../components';
import { useAppSelector } from '../../../hooks';
import { selectCurrentAccount } from '../../../redux/selectors';
import styles from './myFeatureStyles';

const MyFeatureScreen = () => {
  const intl = useIntl();
  const currentAccount = useAppSelector(selectCurrentAccount);

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader title={intl.formatMessage({ id: 'myfeature.title' })} />
      {/* content */}
    </SafeAreaView>
  );
};

export default MyFeatureScreen;
```

`useAppSelector(selectCurrentAccount)` reads the account (81 call sites); `useAuth()` from
`src/hooks` (45) when you only need `{ username, code }`. Reusable UI is exported from the
`src/components/index.tsx` barrel (`BasicHeader`, `MainButton`, `TextInput`, `UserAvatar`, `Icon`).

The styles file default-exports
`EStyleSheet.create({ container: { flex: 1, backgroundColor: '$primaryBackgroundColor' } })`.
Variables are defined in `src/themes/lightTheme.ts` and `darkTheme.ts`: `$primaryBlack` text,
`$primaryDarkGray` secondary text, `$primaryBlue` accent, `$primaryLightBackground` cards,
`$iconColor`, `$primaryRed` destructive. A hex literal breaks dark mode.

## Step 2: both barrels

`src/screens/<feature>/index.ts` does `import MyFeature from './screen/myFeatureScreen';` then
`export { MyFeature }; export default MyFeature;`. Add the import plus the name to the export block
in `src/screens/index.ts`. `stackNavigator.tsx` pulls its screens from that barrel, so a screen
missing from it cannot be registered there. `src/screens/waves` shows the cost of skipping this: it
never reached the barrel, so `botomTabNavigator.tsx` has to reach it by path.

## Step 3: route name

In `src/constants/routeNames.ts`. Entries are template literals over the shared suffix consts. The
object ends `as const`, which is what makes the route names a literal union:

```ts
    MY_FEATURE: `MyFeature${SCREEN_SUFFIX}`,
```

## Step 4: params contract (skip it and typecheck fails)

`src/navigation/types.ts` derives `RouteName` from ROUTES, then asserts every route has an entry:

```ts
export type _MissingRouteContracts = AssertNever<Exclude<RouteName, keyof AppParamList>>;
```

A ROUTES entry with no `AppParamList` entry is a compile error: `TS2344: Type
'"MyNewFeatureScreen"' does not satisfy the constraint 'never'`, plus five cascading `TS2536: Type
'K' cannot be used to index type 'AppParamList'` from the mapped types above it. `yarn typecheck`
runs against an empty baseline, so this fails CI. Add:

```ts
  [ROUTES.SCREENS.MY_FEATURE]: { username?: string } | undefined;
```

Append `| undefined` only if the screen renders with no params. Leaving it off makes params required
at every call site, which is what you want for a screen that cannot render empty (`WEB_BROWSER`,
`VOTERS`, `ASSET_DETAILS`, `CHAT_THREAD`, `PROFILE_EDIT`).

## Step 5: register in the navigator

`src/navigation/stackNavigator.tsx` holds two. `MainStackNavigator` registers the drawer as its
first screen (`ROUTES.DRAWER.MAIN`), so an ordinary screen added to it is a sibling of the drawer
that pushes over it. The root `StackNavigator` holds `MainStackNavigator` itself plus the pre-auth
and full-screen routes (Login, Register, Welcome, PinCode, WebBrowser). Most new screens go in the
main one:

```tsx
<MainStack.Screen name={ROUTES.SCREENS.MY_FEATURE} component={MyFeature} />
```

Put it in the `<MainStack.Group screenOptions={{ animation: 'slide_from_bottom' }}>` block to slide
up, add `options={{ presentation: 'modal' }}` for a true modal. The 15 `as any` casts on existing
rows are legacy prop debt; a new screen needs none.

## Step 6: navigating

`types.ts` declares `ReactNavigation.RootParamList extends AppParamList`, so the untyped hook is
already checked against Step 4. Omitting params for a route that requires them is a compile error,
not a blank screen.

```tsx
const navigation = useNavigation();
navigation.navigate(ROUTES.SCREENS.MY_FEATURE, { username });
```

Reading the params back is not settled house style. Most screens destructure a
`route` prop, usually typed `any`; only two call `useRoute`, one of them with a locally declared
`RouteProp` (`dappBrowser.tsx`). Prefer keying off Step 4 instead. No screen does this yet:

```tsx
import { RouteProp, useRoute } from '@react-navigation/native';
import { AppParamList } from '../../../navigation/types';

const route = useRoute<RouteProp<AppParamList, typeof ROUTES.SCREENS.MY_FEATURE>>();
```

Outside a component (deep links, redux actions) use the equally typed object form,
`RootNavigation.navigate({ name, params })` from `src/navigation/rootNavigation.tsx` (53 sites).

## Step 7: strings

`src/config/locales/en-US.json` is the only catalog you edit; Crowdin owns the other 38. It is
**nested**: all 92 top-level keys are objects, none contains a dot. `src/utils/flattenMessages.ts`
joins the levels with dots at load, so a nested block is read with a dotted id.

```json
{ "myfeature": { "title": "My Feature", "empty": "Nothing here yet" } }
```

```tsx
intl.formatMessage({ id: 'myfeature.title' });
```

## Step 8: data

Server data uses `@ecency/sdk` query options with TanStack Query; mutations use a wrapper in
`src/providers/sdk/mutations/`. See the SDK Migration section of CLAUDE.md. Keep Redux for auth,
settings, UI state and the optimistic cache reducer. Older reducers (`postsReducer`,
`walletReducer`) still hold server data; do not extend them for a new screen.

## Checklist

- [ ] Root is `SafeAreaView` from `react-native-safe-area-context`, no `edges` override
- [ ] `src/screens/<feature>/index.ts` re-exported from `src/screens/index.ts`
- [ ] Route in `routeNames.ts` **and** a params entry in `AppParamList` (`src/navigation/types.ts`)
- [ ] Registered in `src/navigation/stackNavigator.tsx`
- [ ] Nested strings in `en-US.json` only
- [ ] Theme variables, no hex literals
- [ ] `yarn lint` and `yarn typecheck` clean
