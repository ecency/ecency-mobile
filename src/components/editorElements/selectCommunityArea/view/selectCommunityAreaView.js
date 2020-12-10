import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

import { UserAvatar } from '../../../userAvatar';

import globalStyles from '../../../../globalStyles';

import styles from './selectCommunityAreStyles';

const SelectCommunityAreaView = ({ username, onPressIn, onPressOut }) => {
  return (
    <TouchableOpacity
      style={[globalStyles.containerHorizontal16, styles.selectCommunityAreaViewContainer]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <UserAvatar username={username} noAction />
      <Text style={[globalStyles.text, styles.chooseACommunityText]}>
        {`Choose a community (${username})`}
      </Text>
    </TouchableOpacity>
  );
};

export default SelectCommunityAreaView;
