import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import { Icon } from '../icon';
import { getHistoryOpsForSymbol } from '../../utils/walletHistory';
import { getHumanReadableKeyString } from '../../utils/strings';
import styles from './walletHistoryFiltersSheetStyles';

const FALLBACK_SHEET_ID = 'wallet_history_filters';

/**
 * Result of the sheet. Both variants are objects because react-native-actions-sheet
 * publishes `data || payloadRef.current` on close, so a falsy return value is silently
 * replaced by the original payload and a cancel would read as an apply.
 */
export interface WalletHistoryFiltersResult {
  operations?: string[];
  cancelled?: boolean;
}

/**
 * Lets the user narrow which operations a token's history requests.
 *
 * The options are exactly `HIVE_LAYER_HISTORY_OPS[symbol]`, the set that survives all three
 * filters downstream (the SDK's per-asset `select`, `transferTypes`, and the ticker match),
 * so nothing offered here can be picked and then silently render nothing.
 *
 * The selection drives the server-side bitmask rather than a filter on device. Fetching
 * unfiltered and filtering here was measured and rejected: `vote` and
 * `effective_comment_vote` dominate an ordinary account, so a page of 100 yields as few as
 * 2 renderable rows and one screen would cost roughly 500KB instead of 31KB.
 *
 * Resolves with `{ operations }` on apply and `{ cancelled: true }` on cancel. A backdrop,
 * swipe or back dismissal resolves the original payload instead, so callers gate on
 * `operations` being an array rather than on truthiness.
 */
const WalletHistoryFiltersSheet: React.FC<SheetProps<'wallet_history_filters'>> = ({
  sheetId,
  payload,
}) => {
  const intl = useIntl();
  const closedRef = useRef(false);

  const symbol = payload?.symbol ?? 'HIVE';
  const available = getHistoryOpsForSymbol(symbol);

  const [selected, setSelected] = useState<string[]>(
    payload?.selected?.length ? payload.selected : [...available],
  );

  useEffect(() => {
    closedRef.current = false;
    setSelected(payload?.selected?.length ? payload.selected : [...available]);
  }, [payload]);

  const _close = useCallback(
    (result: WalletHistoryFiltersResult) => {
      if (closedRef.current) {
        return;
      }
      closedRef.current = true;
      SheetManager.hide(sheetId ?? FALLBACK_SHEET_ID, { payload: result });
    },
    [sheetId],
  );

  const _toggle = (op: string) =>
    setSelected((prev) => (prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op]));

  const _label = (op: string) =>
    intl.messages[`wallet.${op}`]
      ? intl.formatMessage({ id: `wallet.${op}` })
      : getHumanReadableKeyString(op);

  const allSelected = selected.length === available.length;

  return (
    <ActionSheet
      id={sheetId || FALLBACK_SHEET_ID}
      gestureEnabled
      closeOnTouchBackdrop
      containerStyle={styles.sheetContainer}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{intl.formatMessage({ id: 'wallet.filter_activities' })}</Text>
        <Text style={styles.subtitle}>
          {intl.formatMessage({ id: 'wallet.filter_activities_desc' })}
        </Text>

        <TouchableOpacity
          style={styles.selectAllRow}
          onPress={() => setSelected(allSelected ? [] : [...available])}
          activeOpacity={0.7}
        >
          <Text style={styles.selectAllText}>
            {intl.formatMessage({ id: allSelected ? 'wallet.filter_none' : 'wallet.filter_all' })}
          </Text>
        </TouchableOpacity>

        <ScrollView style={styles.list}>
          {available.map((op) => {
            const isOn = selected.includes(op);
            return (
              <TouchableOpacity
                key={op}
                style={styles.row}
                onPress={() => _toggle(op)}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isOn }}
                accessibilityLabel={_label(op)}
              >
                <Icon
                  iconType="MaterialIcons"
                  name={isOn ? 'check-box' : 'check-box-outline-blank'}
                  size={22}
                  color={EStyleSheet.value(isOn ? '$primaryBlue' : '$iconColor')}
                />
                <Text style={styles.rowText}>{_label(op)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => _close({ cancelled: true })}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>{intl.formatMessage({ id: 'alert.cancel' })}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            // An empty selection cannot be applied: the SDK reads an empty operation list as
            // "no filter" and requests everything, which is the unfiltered page that renders
            // empty on a witness account.
            style={[styles.applyButton, !selected.length && styles.applyButtonDisabled]}
            disabled={!selected.length}
            onPress={() => _close({ operations: selected })}
            activeOpacity={0.7}
          >
            <Text style={styles.applyText}>
              {intl.formatMessage({ id: 'wallet.filter_apply' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ActionSheet>
  );
};

export default WalletHistoryFiltersSheet;
