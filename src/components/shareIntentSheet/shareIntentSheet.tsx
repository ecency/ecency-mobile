import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Icon } from '../icon';

const ShareIntentSheet: React.FC<SheetProps<'share_intent'>> = ({ sheetId, payload: _payload }) => {
  const intl = useIntl();

  const _handleSelection = (target: 'blog' | 'wave') => {
    SheetManager.hide(sheetId, { payload: target });
  };

  const _handleClose = () => {
    SheetManager.hide(sheetId);
  };

  return (
    <ActionSheet id={sheetId} onClose={_handleClose} gestureEnabled>
      <View style={styles.container}>
        <Text style={styles.title}>{intl.formatMessage({ id: 'share_intent.title' })}</Text>

        <TouchableOpacity style={styles.option} onPress={() => _handleSelection('blog')}>
          <Icon
            iconType="MaterialCommunityIcons"
            name="file-document-edit-outline"
            size={28}
            color={EStyleSheet.value('$primaryBlue')}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>
              {intl.formatMessage({ id: 'share_intent.blog_post' })}
            </Text>
            <Text style={styles.optionDescription}>
              {intl.formatMessage({ id: 'share_intent.blog_post_desc' })}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => _handleSelection('wave')}>
          <Icon
            iconType="MaterialCommunityIcons"
            name="waves"
            size={28}
            color={EStyleSheet.value('$primaryBlue')}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>
              {intl.formatMessage({ id: 'share_intent.wave' })}
            </Text>
            <Text style={styles.optionDescription}>
              {intl.formatMessage({ id: 'share_intent.wave_desc' })}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ActionSheet>
  );
};

const styles = EStyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '$primaryBlack',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '$primaryBlack',
  },
  optionDescription: {
    fontSize: 13,
    color: '$iconColor',
    marginTop: 2,
  },
});

export default ShareIntentSheet;
