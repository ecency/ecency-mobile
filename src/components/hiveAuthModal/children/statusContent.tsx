import React from 'react';
import { Text, ActivityIndicator } from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';
import Animated, {
  LinearTransition,
  FadeInUp,
  FadeOutDown,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import styles from '../styles/hiveAuthModal.styles';
import { Icon } from '../..';
import { HiveAuthStatus } from '../hooks/useHiveAuth';

interface StatusContentProps {
  status: HiveAuthStatus;
  statusText: string;
}

export const StatusContent = ({ status, statusText }: StatusContentProps) => {
  const _renderResultIcon = (iconName: string, colorId: string) => (
    <Animated.View entering={ZoomIn.springify().duration(500)} exiting={ZoomOut}>
      <Icon
        iconType="AntDesign"
        name={iconName}
        color={EStyleSheet.value(colorId)}
        size={88}
        style={styles.resultIcon}
      />
    </Animated.View>
  );

  return (
    <>
      {status === HiveAuthStatus.SUCCESS && _renderResultIcon('checkcircleo', '$primaryGreen')}
      {status === HiveAuthStatus.ERROR && _renderResultIcon('closecircleo', '$primaryRed')}

      <Animated.View
        style={styles.statusContent}
        layout={LinearTransition}
        entering={FadeInUp}
        exiting={FadeOutDown}
      >
        {status === HiveAuthStatus.PROCESSING && (
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
            color={EStyleSheet.value('$primaryBlue')}
          />
        )}
        <Text style={styles.statusText}>{statusText}</Text>
      </Animated.View>
    </>
  );
};
