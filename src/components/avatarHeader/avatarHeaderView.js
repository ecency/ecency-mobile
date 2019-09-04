import React from 'react';
import { withNavigation } from 'react-navigation';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { UserAvatar } from '../userAvatar';
import { IconButton } from '../iconButton';

// Styles
import styles from './avatarHeaderStyles';

const TooltipView = ({ username, name, reputation, navigation }) => (
  <LinearGradient
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    colors={['#357ce6', '#2d5aa0']}
    style={styles.headerView}
  >
    <View style={styles.headerContainer}>
      <IconButton
        iconStyle={styles.backIcon}
        iconType="MaterialIcons"
        name="arrow-back"
        onPress={() => navigation.goBack()}
        size={25}
      />
      <View style={styles.wrapper}>
        <UserAvatar noAction size="xl" username={username} />
        <View style={styles.textWrapper}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.username}>{`@${username} (${reputation})`}</Text>
        </View>
      </View>
    </View>
  </LinearGradient>
);

export default withNavigation(TooltipView);
