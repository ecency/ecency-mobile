import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { MainButton } from '../mainButton';

const FALLBACK_SHEET_ID = 'mod_notes';

/**
 * Result of the sheet. Both variants are objects because
 * react-native-actions-sheet 0.9.7 publishes `data || payloadRef.current` on
 * close (dist/src/index.js:403), so a falsy return value is silently replaced
 * by the original payload object. Any `false`/`undefined`/`''` contract would
 * therefore reach the caller as a truthy object and read as a confirmation.
 */
export interface ModNotesResult {
  notes?: string;
  cancelled?: boolean;
}

// Hivemind stores the note on the moderation action itself. Web caps the same
// field at 120 characters, so keep the two clients consistent.
const DEFAULT_MAX_LENGTH = 120;

/**
 * Prompts a moderator for the free-text reason that community moderation
 * operations carry (mutePost/unmutePost take a required `notes` field).
 *
 * Resolves the `SheetManager.show` promise with `{ notes }` on confirm and
 * `{ cancelled: true }` on an explicit cancel. Dismissing by backdrop, swipe or
 * back button resolves the original payload object instead (see ModNotesResult),
 * so callers must gate on a string `notes` rather than on truthiness.
 */
const ModNotesSheet: React.FC<SheetProps<'mod_notes'>> = ({ sheetId, payload }) => {
  const intl = useIntl();
  const [value, setValue] = useState('');
  const closedRef = useRef(false);

  const maxLength = payload?.maxLength ?? DEFAULT_MAX_LENGTH;

  const _reset = useCallback(() => {
    closedRef.current = false;
    setValue('');
  }, []);

  // react-native-actions-sheet keeps registered sheets mounted, so without a
  // reset the previous moderator's note would be prefilled on the next open and
  // closedRef would still be true, leaving confirm and cancel unable to close
  // the sheet at all.
  //
  // Resetting on `payload` identity alone is not enough: payload is optional
  // and a caller may reopen with no payload or the same object, in which case
  // the effect never re-runs. onBeforeShow fires on every presentation, so it
  // is the authoritative reset; the effect covers a payload swap while the
  // sheet is already open.
  useEffect(() => {
    _reset();
  }, [payload, _reset]);

  const _close = (result: ModNotesResult) => {
    if (closedRef.current) {
      return;
    }
    closedRef.current = true;
    SheetManager.hide(sheetId || FALLBACK_SHEET_ID, { payload: result });
  };

  const _handleConfirm = () => {
    const notes = value.trim();
    if (!notes) {
      return;
    }
    _close({ notes });
  };

  return (
    <ActionSheet
      id={sheetId || FALLBACK_SHEET_ID}
      gestureEnabled
      closeOnTouchBackdrop
      onBeforeShow={_reset}
      containerStyle={styles.sheetContainer}
    >
      <View style={styles.container}>
        <Text style={styles.title}>
          {payload?.title || intl.formatMessage({ id: 'mod_notes.title' })}
        </Text>

        {!!payload?.description && <Text style={styles.description}>{payload.description}</Text>}

        <TextInput
          style={styles.input}
          placeholder={payload?.placeholder || intl.formatMessage({ id: 'mod_notes.placeholder' })}
          placeholderTextColor={EStyleSheet.value('$primaryDarkGray')}
          autoCapitalize="sentences"
          autoCorrect
          autoFocus
          value={value}
          onChangeText={setValue}
          maxLength={maxLength}
          returnKeyType="done"
          onSubmitEditing={_handleConfirm}
        />

        <Text style={styles.counter}>{`${value.length} / ${maxLength}`}</Text>

        <MainButton
          onPress={_handleConfirm}
          isDisable={!value.trim()}
          text={payload?.confirmLabel || intl.formatMessage({ id: 'mod_notes.confirm' })}
          style={styles.confirmButton}
        />

        <MainButton
          onPress={() => _close({ cancelled: true })}
          text={intl.formatMessage({ id: 'mod_notes.cancel' })}
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />
      </View>
    </ActionSheet>
  );
};

const styles = EStyleSheet.create({
  sheetContainer: {
    paddingHorizontal: 0,
    backgroundColor: '$primaryBackgroundColor',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '$primaryBlack',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '$primaryDarkGray',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '$primaryLightGray',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '$primaryBlack',
    backgroundColor: '$primaryLightBackground',
  },
  counter: {
    fontSize: 12,
    color: '$primaryDarkGray',
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 12,
  },
  confirmButton: {
    marginBottom: 0,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '$primaryDarkGray',
  },
});

export default ModNotesSheet;
