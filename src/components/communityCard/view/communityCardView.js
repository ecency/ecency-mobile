import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

import { UserAvatar } from '../../userAvatar';

import styles from './communityCardStyles';

const CommunityCardView = ({ community, onPress, style, separators }) => {
  return (
    <TouchableOpacity onPress={() => onPress(community)} style={[styles.communityCard, style]}>
      <UserAvatar username={community.name} noAction />
      <Text style={styles.text}>{community.title}</Text>
    </TouchableOpacity>
  );
};

export default CommunityCardView;
