import React, { useRef } from 'react';
import { View } from 'react-native';
import { TabBar, TabBarProps, Route } from 'react-native-tab-view';
import { IconButton } from '../index';
import WavesTagPickerModal, {
  WavesTagPickerModalRef,
} from '../wavesTagPickerModal/wavesTagPickerModal';
import styles from './wavesTabBarStyles';

interface Props extends TabBarProps<Route> {
  // Called with the pressed route key ("for-you" / "following" / "tag:<t>").
  onTabPress: (key: string) => void;
}

/**
 * Waves tab bar: For you / Following / #tag tabs plus a trailing "+" that opens
 * the tag picker. With just the two base tabs the bar fills the width evenly
 * (X-style); once enough tags are pinned to overflow it switches to scrolling.
 */
const WavesTabBar = ({ onTabPress, ...props }: Props) => {
  const pickerRef = useRef<WavesTagPickerModalRef>(null);

  const scrollEnabled = props.navigationState.routes.length > 2;

  return (
    <View style={styles.container}>
      <TabBar
        {...props}
        style={styles.tabBarStyle}
        indicatorStyle={styles.indicatorStyle}
        tabStyle={scrollEnabled ? styles.tabStyleScroll : undefined}
        scrollEnabled={scrollEnabled}
        onTabPress={({ route, preventDefault }) => {
          preventDefault();
          onTabPress(route.key);
        }}
      />
      <IconButton
        style={styles.addButtonWrapper}
        iconStyle={styles.addButtonIcon}
        iconType="MaterialIcon"
        name="add"
        size={28}
        accessibilityLabel="Add tag feed"
        onPress={() => pickerRef.current?.show()}
      />
      <WavesTagPickerModal ref={pickerRef} />
    </View>
  );
};

export default WavesTabBar;
