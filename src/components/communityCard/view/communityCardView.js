import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

import { UserAvatar } from '../../userAvatar';

import styles from './communityCardStyles';

const CommunityCardView = ({ community, onPress, style }) => {
  return (
    <TouchableOpacity onPress={() => onPress(community)} style={[styles.communityCard, style]}>
      <UserAvatar username={community.name} noAction />
      <Text style={styles.text}>{community.title}</Text>
    </TouchableOpacity>
  );
};

export default CommunityCardView;
