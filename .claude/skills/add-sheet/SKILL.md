---
name: add-sheet
description: Add a new bottom sheet (action sheet) to the mobile app
argument-hint: [sheet-name]
disable-model-invocation: true
---

# Add Sheet

Create a new bottom sheet using `react-native-actions-sheet`.

## Step 1: Create the Sheet Component

Location: `src/components/<sheetName>/<sheetName>.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { MainButton } from '../mainButton';

const MySheet: React.FC<SheetProps<'my_sheet'>> = ({ sheetId, payload }) => {
  const intl = useIntl();

  // IMPORTANT: react-native-actions-sheet keeps registered sheets mounted.
  // State persists between invocations. Reset in useEffect if needed:
  // useEffect(() => { resetState(); }, [payload]);

  const _handleConfirm = () => {
    // Return a value to the caller
    SheetManager.hide(sheetId, { payload: 'result_value' });
  };

  const _handleCancel = () => {
    // Return false/undefined to indicate cancellation
    SheetManager.hide(sheetId, { payload: false });
  };

  return (
    <ActionSheet id={sheetId}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {intl.formatMessage({ id: 'my_sheet.title' })}
        </Text>
        <MainButton
          text={intl.formatMessage({ id: 'my_sheet.confirm' })}
          onPress={_handleConfirm}
        />
      </View>
    </ActionSheet>
  );
};

const styles = EStyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '$primaryBackgroundColor',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '$primaryBlack',
  },
});

export default MySheet;
```

## Step 2: Create Index File

Location: `src/components/<sheetName>/index.ts`

```typescript
export { default as MySheet } from './<sheetName>';
```

## Step 3: Export from Components

Add to `src/components/index.tsx`:

```typescript
export { MySheet } from './<sheetName>';
```

## Step 4: Register the Sheet

In `src/navigation/sheets.tsx`:

1. Import the component:
```typescript
import { MySheet } from '../components';
```

2. Add to `SheetNames` enum:
```typescript
export enum SheetNames {
  // ... existing
  MY_SHEET = 'my_sheet',
}
```

3. Register:
```typescript
registerSheet(SheetNames.MY_SHEET, MySheet);
```

4. Add TypeScript definition:
```typescript
declare module 'react-native-actions-sheet' {
  interface Sheets {
    // ... existing
    [SheetNames.MY_SHEET]: SheetDefinition<{
      payload: {
        someParam: string;
      };
      returnValue: string | false;  // what hide() returns
    }>;
  }
}
```

## Step 5: Show the Sheet

From anywhere in the app:

```typescript
import { SheetManager } from 'react-native-actions-sheet';
import { SheetNames } from '../navigation/sheets';

// Async — waits for sheet to close and returns the result
const result = await SheetManager.show(SheetNames.MY_SHEET, {
  payload: { someParam: 'value' },
});

if (result) {
  // User confirmed
} else {
  // User cancelled (backdrop tap or explicit cancel)
}
```

## Step 6: Add i18n Strings

In `src/config/locales/en-US.json`:

```json
{
  "my_sheet.title": "Sheet Title",
  "my_sheet.confirm": "Confirm",
  "my_sheet.cancel": "Cancel"
}
```

## Styling Notes

- Use `$primaryBackgroundColor` for backgrounds (supports dark mode)
- Use `$primaryBlack` for text (adapts to theme)
- Use `$iconColor` for icons
- Import `EStyleSheet` from `react-native-extended-stylesheet`

## State Reset Pattern

Sheets stay mounted. If your sheet has state, reset it when payload changes:

```typescript
useEffect(() => {
  setInput('');
  setError('');
  setLoading(false);
}, [payload]);
```

## Common Gotchas

1. **Sheets are always mounted** — state persists between show/hide cycles. Always reset state on payload change.
2. **Use `SheetManager.hide(sheetId, { payload: value })` to return values** — the `show()` promise resolves with this value.
3. **Backdrop tap returns `undefined`** — handle this as cancellation in the caller.
4. **Use `useIntl` for strings** — not hardcoded text.
5. **Theme support** — use EStyleSheet `$variables` for colors, not hardcoded values.
