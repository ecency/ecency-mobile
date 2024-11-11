
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
    status:HiveAuthStatus,
    statusText:string
}

export const StatusContent = ({ status, statusText}:StatusContentProps) => {

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
                style={{ flexDirection: 'row', alignItems: 'center' }}
                layout={LinearTransition}
                entering={FadeInUp}
                exiting={FadeOutDown}
            >
                {status === HiveAuthStatus.PROCESSING && (
                    <ActivityIndicator
                        style={{ marginRight: 16 }}
                        size="large"
                        color={EStyleSheet.value('$primaryBlue')}
                    />
                )}
                <Text
                    style={{
                        color: EStyleSheet.value('$primaryDarkText'),
                        fontWeight: 300,
                        fontSize: 24,
                        textAlign: 'center',
                    }}
                >
                    {statusText}
                </Text>
            </Animated.View>
        </>
    )
}