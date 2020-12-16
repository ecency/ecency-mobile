import React, { useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { injectIntl } from 'react-intl';

import { UserAvatar } from '../../../userAvatar';
import { Icon } from '../../../icon';
import globalStyles from '../../../../globalStyles';

import styles from './selectCommunityAreStyles';

const SelectCommunityAreaView = ({
  community,
  mode,
  currentAccount,
  onPressIn,
  onPressOut,
  intl,
}) => {
  return (
    <TouchableOpacity
      style={[globalStyles.containerHorizontal16, styles.selectCommunityAreaViewContainer]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <UserAvatar username={mode === 'community' ? community.name : currentAccount.name} noAction />
      <Text style={[globalStyles.text, styles.chooseACommunityText]}>
        {mode === 'community' ? community.title : intl.formatMessage({ id: 'editor.my_blog' })}
      </Text>
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
