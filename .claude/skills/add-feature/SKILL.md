---
name: add-feature
description: Add a new feature or screen to the Ecency mobile app following established patterns
argument-hint: [feature-name]
disable-model-invocation: true
---

# Add Feature

Guide for adding a new feature to the Ecency mobile app.

## Screen Structure Patterns

The app uses two patterns for screens:

### Pattern 1: Class Component (Legacy — existing screens)

Many existing screens use class components with container/view separation:

```
src/screens/<feature>/
  screen/<feature>Screen.tsx     # Class component with business logic
  screen/<feature>Styles.ts      # EStyleSheet styles
```

Example: `src/screens/transfer/screen/delegateScreen.tsx`

### Pattern 2: Functional Component (Preferred for new screens)

New screens should use functional components with hooks:

```
src/screens/<feature>/
  screen/<feature>Screen.tsx     # Functional component
  children/                      # Sub-components
  hooks/                         # Custom hooks
```

## Step 1: Create the Screen

Location: `src/screens/<feature>/screen/<feature>Screen.tsx`

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { useQuery } from '@tanstack/react-query';
import { getSomeQueryOptions } from '@ecency/sdk';
import { BasicHeader } from '../../../components';
import { useAppSelector } from '../../../hooks';
import { selectCurrentAccount } from '../../../redux/selectors';
import styles from './<feature>Styles';

const FeatureScreen = ({ route, navigation }) => {
  const intl = useIntl();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const { data, isLoading } = useQuery(getSomeQueryOptions(currentAccount?.name));

  return (
    <View style={styles.container}>
      <BasicHeader title={intl.formatMessage({ id: 'feature.title' })} />
      {/* Screen content */}
    </View>
  );
};

export default FeatureScreen;
```

## Step 2: Add Route

In `src/constants/routeNames.ts`:

```typescript
export default {
  SCREENS: {
    // ... existing
    FEATURE: 'Feature',
  },
  // ...
};
```

## Step 3: Add to Stack Navigator

In `src/navigation/stackNavigator.tsx`:

```typescript
import FeatureScreen from '../screens/<feature>/screen/<feature>Screen';

// Inside the Stack.Navigator:
<Stack.Screen name={ROUTES.SCREENS.FEATURE} component={FeatureScreen} />
```

## Step 4: Navigation

```typescript
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routeNames';

const navigation = useNavigation();
navigation.navigate(ROUTES.SCREENS.FEATURE, { /* params */ });
```

## Step 5: Internationalization

Add strings to `src/config/locales/en-US.json`:

```json
{
  "feature.title": "Feature Title",
  "feature.description": "Some description"
}
```

Use with `react-intl`:
```typescript
import { useIntl } from 'react-intl';
const intl = useIntl();
intl.formatMessage({ id: 'feature.title' });
```

## Step 6: Styling

Use `react-native-extended-stylesheet` with theme variables:

```typescript
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  title: {
    color: '$primaryBlack',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '$primaryDarkGray',
    fontSize: 14,
  },
});
```

Key theme variables:
- `$primaryBackgroundColor` — main background
- `$primaryLightBackground` — card/section background
- `$primaryBlack` — primary text
- `$primaryDarkGray` — secondary text
- `$primaryBlue` — accent/link color
- `$iconColor` — icon tint
- `$primaryRed` — error/destructive

## Step 7: State Management

| State type | Where | When |
|---|---|---|
| Blockchain/API data | TanStack Query via SDK query options | Always for server data |
| Global app state | Redux (`src/redux/reducers/`) | Auth, settings, UI state |
| Optimistic updates | Redux cache reducer | Vote caching, post metadata |
| Local component state | `useState`/`useReducer` | Form inputs, toggles |

### Redux Access
```typescript
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectCurrentAccount } from '../../redux/selectors';
import { someAction } from '../../redux/actions/someAction';

const currentAccount = useAppSelector(selectCurrentAccount);
const dispatch = useAppDispatch();
dispatch(someAction(payload));
```

## Step 8: Reusable Components

Common components from `src/components/`:
- `BasicHeader` — screen header with back button
- `MainButton` — primary action button
- `TextInput` — styled text input
- `UserAvatar` — user profile picture
- `Icon` — icon component
- `Modal` — modal dialog
- `PostCard` — post list item
- `ProfileSummary` — user profile header

## Checklist

- [ ] Screen created with proper structure
- [ ] Route added to `routeNames.ts`
- [ ] Screen registered in `stackNavigator.tsx`
- [ ] i18n strings in `en-US.json`
- [ ] Theme variables used (dark mode support)
- [ ] SDK queries used for blockchain data
- [ ] `yarn lint` passes
