import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { injectIntl } from 'react-intl';

import { UserAvatar } from '../../../userAvatar';
import { Icon } from '../../../icon';
import globalStyles from '../../../../globalStyles';

import styles from './selectCommunityAreStyles';

const SelectCommunityAreaView = ({
  selectedCommunity,
  selectedAccount,
  onPressIn,
  onPressOut,
  intl,
}) => {
  let username = null;
  let title = intl.formatMessage({ id: 'editor.select_community' });

  if (selectedCommunity) {
    username = selectedCommunity.name;
    title = selectedCommunity.title;
  } else if (selectedAccount) {
    username = selectedAccount.name;
    title = intl.formatMessage({ id: 'editor.my_blog' });
  }

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
    </TouchableOpacity>
  );
};

export default injectIntl(SelectCommunityAreaView);
