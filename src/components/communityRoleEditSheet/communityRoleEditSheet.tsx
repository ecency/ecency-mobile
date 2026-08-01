import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import debounce from 'lodash/debounce';
import { getQueryClient, lookupAccountsQueryOptions } from '@ecency/sdk';
import { Icon } from '../icon';
import { UserAvatar } from '../userAvatar';

// Enough to disambiguate without turning the sheet into a scroller.
const MAX_SUGGESTIONS = 6;

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  // lookup_accounts is a prefix search that returns neighbouring names even for
  // nonsense input, so an account only counts as real on an exact match. Same
  // rule the transfer screen uses.
  const [isKnownAccount, setIsKnownAccount] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const _lookup = useMemo(
    () =>
      debounce(async (value: string) => {
        if (!value) {
          setSuggestions([]);
          setIsKnownAccount(false);
          setIsSearching(false);
          return;
        }
        try {
          const results: string[] =
            (await getQueryClient().fetchQuery(lookupAccountsQueryOptions(value, 20))) ?? [];
          setSuggestions(results.slice(0, MAX_SUGGESTIONS));
          setIsKnownAccount(results.includes(value));
        } catch {
          setSuggestions([]);
          setIsKnownAccount(false);
        } finally {
          setIsSearching(false);
        }
      }, 300),
    [],
  );

  const lookupRef = useRef(_lookup);
  lookupRef.current = _lookup;

  useEffect(() => () => lookupRef.current?.cancel(), []);

  const _reset = useCallback(() => {
    const seeded = payload?.account ?? '';
    setAccount(seeded);
    setSuggestions([]);
    // A row-opened sheet already names a real member; a typed one starts unknown.
    setIsKnownAccount(!!seeded);
    setIsSearching(false);
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

  const _normalize = (value: string) => value.trim().toLowerCase().replace(/^@/, '');

  const _handleChangeAccount = (text: string) => {
    const name = _normalize(text);
    setAccount(name);
    setIsKnownAccount(false);
    setError('');
    setIsSearching(!!name);
    _lookup(name);
  };

  const _handlePickSuggestion = (name: string) => {
    _lookup.cancel();
    setAccount(name);
    setSuggestions([]);
    setIsKnownAccount(true);
    setIsSearching(false);
    setError('');
  };

  const _handleSelect = (role: string) => {
    if (!editableAccount) {
      _close({ account: payload?.account, role });
      return;
    }

    // Resolved against the chain rather than a format rule, so an account that
    // merely looks valid cannot be sent to a transaction that would fail.
    if (!account || !isKnownAccount) {
      setError(intl.formatMessage({ id: 'community.invalid_username' }));
      return;
    }

    _close({ account, role });
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
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder={intl.formatMessage({ id: 'community.username_placeholder' })}
                placeholderTextColor={EStyleSheet.value('$primaryDarkGray')}
                autoCapitalize="none"
                autoCorrect={false}
                value={account}
                onChangeText={_handleChangeAccount}
              />
              {isSearching && <ActivityIndicator style={styles.inputSpinner} size="small" />}
              {!isSearching && isKnownAccount && (
                <Icon
                  iconType="MaterialCommunityIcons"
                  name="check-circle"
                  size={20}
                  style={styles.inputSpinner}
                  color={EStyleSheet.value('$primaryBlue')}
                />
              )}
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            {/* Plain views rather than a FlatList: nesting a VirtualizedList
                inside the sheet's scroll view warns and breaks taps. */}
            {suggestions.length > 0 && !isKnownAccount && (
              <View style={styles.suggestions}>
                {suggestions.map((name) => (
                  <TouchableOpacity
                    key={name}
                    style={styles.suggestionRow}
                    onPress={() => _handlePickSuggestion(name)}
                  >
                    <UserAvatar username={name} size="small" noAction />
                    <Text style={styles.suggestionText}>{name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

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
          const isBlocked = isCurrent || (editableAccount && !isKnownAccount);
          return (
            <TouchableOpacity
              key={role}
              style={styles.row}
              disabled={isBlocked}
              onPress={() => _handleSelect(role)}
            >
              <Text style={[styles.rowLabel, isBlocked && styles.rowLabelCurrent]}>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '$primaryLightGray',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingRight: 40,
    fontSize: 15,
    color: '$primaryBlack',
    backgroundColor: '$primaryLightBackground',
  },
  inputSpinner: {
    position: 'absolute',
    right: 12,
  },
  suggestions: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '$primaryLightBackground',
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suggestionText: {
    marginLeft: 10,
    fontSize: 15,
    color: '$primaryBlack',
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
