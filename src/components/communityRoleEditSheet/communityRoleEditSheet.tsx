import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Icon } from '../icon';

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
  role?: string;
  cancelled?: boolean;
}

const CommunityRoleEditSheet: React.FC<SheetProps<'community_role_edit'>> = ({
  sheetId,
  payload,
}) => {
  const intl = useIntl();

  const account = payload?.account ?? '';
  const currentRole = payload?.currentRole ?? '';
  const assignableRoles = payload?.assignableRoles ?? [];

  const _close = (result: CommunityRoleEditResult) => {
    SheetManager.hide(sheetId || FALLBACK_SHEET_ID, { payload: result });
  };

  return (
    <ActionSheet
      id={sheetId || FALLBACK_SHEET_ID}
      gestureEnabled
      closeOnTouchBackdrop
      containerStyle={styles.sheetContainer}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{intl.formatMessage({ id: 'community.set_role' })}</Text>
        <Text style={styles.subtitle}>{`@${account}`}</Text>

        {assignableRoles.map((role) => {
          const isCurrent = role === currentRole;
          return (
            <TouchableOpacity
              key={role}
              style={styles.row}
              disabled={isCurrent}
              onPress={() => _close({ role })}
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
