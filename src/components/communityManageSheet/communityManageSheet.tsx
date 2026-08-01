import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Icon } from '../icon';

const FALLBACK_SHEET_ID = 'community_manage';

/** Destinations offered to a community moderator. */
export type CommunityManageAction = 'members' | 'settings';

interface Row {
  action: CommunityManageAction;
  icon: string;
  iconType: string;
  labelId: string;
  /** Rendered only when the viewer can actually use the destination. */
  requires?: 'settings';
}

// Rows are added here as each destination screen lands.
const ROWS: Row[] = [
  {
    action: 'members',
    icon: 'account-group',
    iconType: 'MaterialCommunityIcons',
    labelId: 'community.manage_members',
  },
  {
    action: 'settings',
    icon: 'cog-outline',
    iconType: 'MaterialCommunityIcons',
    labelId: 'community.manage_settings',
    requires: 'settings',
  },
];

/**
 * Moderator entry point for a community, opened from the community header.
 *
 * Resolves the `SheetManager.show` promise with `{ action }` on selection.
 * Dismissing by backdrop, swipe or back resolves the original payload object,
 * because the library publishes `data || payloadRef.current` on close, so
 * callers must gate on a known `action` value rather than on truthiness.
 */
const CommunityManageSheet: React.FC<SheetProps<'community_manage'>> = ({ sheetId, payload }) => {
  const intl = useIntl();

  // Editing community props is owner and admin only, so a plain mod is not
  // offered a screen where every field would be read-only.
  const rows = ROWS.filter((row) => row.requires !== 'settings' || !!payload?.canEditSettings);

  const _select = (action: CommunityManageAction) => {
    SheetManager.hide(sheetId || FALLBACK_SHEET_ID, { payload: { action } });
  };

  return (
    <ActionSheet
      id={sheetId || FALLBACK_SHEET_ID}
      gestureEnabled
      closeOnTouchBackdrop
      containerStyle={styles.sheetContainer}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{intl.formatMessage({ id: 'community.manage' })}</Text>

        {rows.map((row) => (
          <TouchableOpacity key={row.action} style={styles.row} onPress={() => _select(row.action)}>
            <Icon
              iconType={row.iconType}
              name={row.icon}
              size={22}
              style={styles.rowIcon}
              color={EStyleSheet.value('$primaryDarkGray')}
            />
            <Text style={styles.rowLabel}>{intl.formatMessage({ id: row.labelId })}</Text>
          </TouchableOpacity>
        ))}
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
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowIcon: {
    marginRight: 14,
  },
  rowLabel: {
    fontSize: 16,
    color: '$primaryBlack',
  },
});

export default CommunityManageSheet;
