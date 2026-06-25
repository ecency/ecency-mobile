import React, { useRef } from 'react';
import { useWindowDimensions, View } from 'react-native';
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
 * Waves tab bar. Mirrors the home-feed FeedTabBar look: uppercase blue "pill"
 * active tab (via the TabView commonOptions.label renderer) over a transparent
 * indicator, scrollable tabs, and a trailing "+" that opens the tag picker.
 *
 * Always scrollable: an even-fill (scrollEnabled=false) layout sizes the tabs
 * to the full window width and pushes the "+" off-screen, which is exactly the
 * bug that hid it. Content-width scrollable tabs leave room for the "+".
 */
const WavesTabBar = ({ onTabPress, ...props }: Props) => {
  const pickerRef = useRef<WavesTagPickerModalRef>(null);
  const layout = useWindowDimensions();

  return (
    <View style={styles.container}>
      <TabBar
        {...props}
        style={styles.tabBarStyle}
        indicatorStyle={styles.indicatorStyle}
        // minWidth mirrors FeedTabBar: a third of the width, minus ~14px for the
        // trailing "+" button's padding (paddingLeft 8 + paddingRight 12).
        tabStyle={{ ...styles.tabStyle, minWidth: layout.width / 3 - 14 }}
        scrollEnabled={true}
        onTabPress={({ route, preventDefault }) => {
          preventDefault();
          onTabPress(route.key);
        }}
      />
      <IconButton
        style={styles.addButtonWrapper}
        iconStyle={styles.addButtonIcon}
        // No iconType -> Icon's default renders Ionicons "add", identical to the
        // main feed tab bar's "+" (feedTabBar reaches it via a "MaterialIcon"
        // typo; we select the default explicitly).
        iconType={undefined}
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
