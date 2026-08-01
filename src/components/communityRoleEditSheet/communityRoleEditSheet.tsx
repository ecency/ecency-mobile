import React, { useCallback, useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Icon } from '../icon';
import { getUsernameError } from '../../utils/usernameValidation';

const FALLBACK_SHEET_ID = 'community_role_edit';

/**
 * Result of the sheet.
 *
 * An object rather than a bare role string because react-native-actions-sheet
 * 0.9.7 publishes `data || payloadRef.current` on close, so any falsy return
 * value is replaced by the original payload object. Callers must gate on a
 * string `role` rather than on truthiness.
 */
export interface CommunityRoleEditResult {
  account?: string;
  role?: string;
  cancelled?: boolean;
}

/**
 * Role picker, in two modes.
 *
 * Fixed account: opened from a member row, so the account is shown and only the
 * role is chosen. Editable account: opened from the members header, where the
 * moderator types any account. That is how you mute someone who never
 * subscribed, or promote a specific user without scrolling a roster that can
 * run to thousands of rows.
 */
const CommunityRoleEditSheet: React.FC<SheetProps<'community_role_edit'>> = ({
  sheetId,
  payload,
}) => {
  const intl = useIntl();

  const editableAccount = !!payload?.editableAccount;
  const currentRole = payload?.currentRole ?? '';
  const assignableRoles = payload?.assignableRoles ?? [];

  const [account, setAccount] = useState('');
  const [error, setError] = useState('');

  const _reset = useCallback(() => {
    setAccount(payload?.account ?? '');
    setError('');
  }, [payload?.account]);

  // Registered sheets stay mounted, and resetting on payload identity alone is
  // not enough when the same payload object is reused, so reset on every
  // presentation.
  useEffect(() => {
    _reset();
  }, [payload, _reset]);

  const _close = (result: CommunityRoleEditResult) => {
    SheetManager.hide(sheetId || FALLBACK_SHEET_ID, { payload: result });
  };

  const _handleSelect = (role: string) => {
    if (!editableAccount) {
      _close({ account: payload?.account, role });
      return;
    }

    const name = account.trim().toLowerCase().replace(/^@/, '');
    const formatError = getUsernameError(name);

    // `exchange` and `restricted` are registration policy rather than chain
    // validity, and a moderator may specifically need to mute those accounts,
    // so only genuine format errors block here.
    if (!name || (formatError && formatError !== 'exchange' && formatError !== 'restricted')) {
      setError(intl.formatMessage({ id: 'community.invalid_username' }));
      return;
    }

    _close({ account: name, role });
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
          {intl.formatMessage({
            id: editableAccount ? 'community.assign_role' : 'community.set_role',
          })}
        </Text>

        {editableAccount ? (
          <>
            <TextInput
              style={styles.input}
              placeholder={intl.formatMessage({ id: 'community.username_placeholder' })}
              placeholderTextColor={EStyleSheet.value('$primaryDarkGray')}
              autoCapitalize="none"
              autoCorrect={false}
              value={account}
              onChangeText={(text) => {
                setAccount(text);
                setError('');
              }}
            />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <Text style={styles.hint}>
              {intl.formatMessage({ id: 'community.assign_role_hint' })}
            </Text>
          </>
        ) : (
          <Text style={styles.subtitle}>{`@${payload?.account ?? ''}`}</Text>
        )}

        {assignableRoles.map((role) => {
          // Only meaningful with a fixed account; while typing a name we do not
          // know that account's current role yet.
          const isCurrent = !editableAccount && role === currentRole;
          return (
            <TouchableOpacity
              key={role}
              style={styles.row}
              disabled={isCurrent}
              onPress={() => _handleSelect(role)}
            >
              <Text style={[styles.rowLabel, isCurrent && styles.rowLabelCurrent]}>
                {intl.formatMessage({ id: `community.role_${role}` })}
              </Text>
              {isCurrent && (
                <Icon
                  iconType="MaterialCommunityIcons"
                  name="check"
                  size={20}
                  color={EStyleSheet.value('$primaryBlue')}
                />
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.cancelRow} onPress={() => _close({ cancelled: true })}>
          <Text style={styles.cancelLabel}>{intl.formatMessage({ id: 'alert.cancel' })}</Text>
        </TouchableOpacity>
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
  },
  subtitle: {
    fontSize: 14,
    color: '$primaryDarkGray',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
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
    marginTop: 12,
  },
  error: {
    marginTop: 6,
    color: '$primaryRed',
    fontSize: 12,
  },
  hint: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 12,
    color: '$primaryDarkGray',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 16,
    color: '$primaryBlack',
  },
  rowLabelCurrent: {
    color: '$primaryDarkGray',
  },
  cancelRow: {
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelLabel: {
    fontSize: 16,
    color: '$primaryDarkGray',
    textAlign: 'center',
  },
});

export default CommunityRoleEditSheet;
