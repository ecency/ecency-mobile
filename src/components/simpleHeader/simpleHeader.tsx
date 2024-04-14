import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { IconButton } from '../index';

import styles from './simpleHeaderStyles';

const SimpleHeader = ({ onBackPress }: any) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View styles={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.backIconContainer}>
            <IconButton
              iconStyle={styles.backIcon}
              iconType="MaterialIcons"
              name="close"
              onPress={onBackPress}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SimpleHeader;
