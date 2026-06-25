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
 * Waves tab bar: the scrollable For you / Following / #tag tabs plus a trailing
 * "+" that opens the tag picker, mirroring the home feed's customisable tab bar.
 */
const WavesTabBar = ({ onTabPress, ...props }: Props) => {
  const pickerRef = useRef<WavesTagPickerModalRef>(null);

  return (
    <View style={styles.container}>
      <TabBar
        {...props}
        style={styles.tabBarStyle}
        indicatorStyle={styles.indicatorStyle}
        tabStyle={styles.tabStyle}
        scrollEnabled={true}
        onTabPress={({ route, preventDefault }) => {
          preventDefault();
          onTabPress(route.key);
        }}
      />
      <IconButton
        style={styles.addButtonWrapper}
        iconStyle={styles.addButtonIcon}
        iconType="MaterialIcons"
        name="add"
        size={26}
        onPress={() => pickerRef.current?.show()}
      />
      <WavesTagPickerModal ref={pickerRef} />
    </View>
  );
};

export default WavesTabBar;
