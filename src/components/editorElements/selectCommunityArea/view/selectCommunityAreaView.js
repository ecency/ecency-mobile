import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { injectIntl } from 'react-intl';

import EStyleSheet from 'react-native-extended-stylesheet';
import { UserAvatar } from '../../../userAvatar';
import { Icon } from '../../../icon';
import globalStyles from '../../../../globalStyles';

import styles from './selectCommunityAreStyles';

import { PopoverWrapper } from '../../..';

const SelectCommunityAreaView = ({
  selectedCommunity,
  selectedAccount,
  canPostToCommunity = true,
  onPressIn,
  onPressOut,
  intl,
}) => {
  let username = null;
  let title = intl.formatMessage({ id: 'editor.select_community' });

  if (selectedCommunity) {
    username = selectedCommunity.name;
    const { title: _title } = selectedCommunity;
    title = _title;
  } else if (selectedAccount) {
    username = selectedAccount.name;
    title = intl.formatMessage({ id: 'editor.my_blog' });
  }

  const _renderRestrictionIcon = !canPostToCommunity && (
    <PopoverWrapper
      text={intl.formatMessage(
        { id: 'editor.community_restriction' },
        { title: selectedCommunity?.title },
      )}
    >
      <Icon
        name="alert-circle-outline"
        iconType="MaterialCommuntyIcon"
        size={24}
        color={EStyleSheet.value('$primaryRed')}
        style={{ marginLeft: 8 }}
      />
    </PopoverWrapper>
  );

  return (
    <TouchableOpacity
      style={[globalStyles.containerHorizontal16, styles.selectCommunityAreaViewContainer]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <UserAvatar username={username} noAction />
      <Text style={[globalStyles.text, styles.chooseACommunityText]}>{title}</Text>
      <Icon
        size={24}
        iconStyle={styles.leftIcon}
        style={styles.icon}
        name="arrow-drop-down"
        iconType="MaterialIcons"
      />

      {_renderRestrictionIcon}
    </TouchableOpacity>
  );
};

export default injectIntl(SelectCommunityAreaView);
