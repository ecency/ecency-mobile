import React, { useRef } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { TabBar, TabBarProps } from 'react-native-tab-view';
import { IconButton } from '../index';
import WavesTagPickerModal from '../wavesTagPickerModal/wavesTagPickerModal';
import styles from './wavesTabBarStyles';

interface Props extends Partial<Omit<TabBarProps<any>, 'onTabPress'>> {
  // Called with the pressed route key ("for-you" / "following" / "tag:<t>").
  onTabPress: (key: string) => void;
}

/**
 * Waves tab bar. Mirrors the home-feed FeedTabBar look: uppercase blue "pill"
 * active tab (via the TabView commonOptions.label renderer) over a transparent
 * indicator, scrollable tabs, and a trailing "+" that opens the tag picker.
 *
 * Always scrollEnabled (so the "+" is never clipped): with scrollEnabled=false
 * react-native-tab-view sizes each tab to the FULL window width, overflowing the
 * row and pushing the "+" off-screen. Instead, while there are only the two base
 * tabs we give each tab an explicit width of (availableWidth / 2) so they fill
 * the bar evenly; once a custom #tag tab is pinned we fall back to FeedTabBar's
 * content-width min-width and the bar scrolls.
 */
// Width reserved for the trailing "+" button (its wrapper is 44px wide).
const ADD_BUTTON_WIDTH = 44;

const WavesTabBar = ({ onTabPress, ...props }: Props) => {
  const pickerRef = useRef<any>(null);
  const layout = useWindowDimensions();

  const tabCount = props.navigationState!.routes.length;
  const tabStyle =
    tabCount <= 2
      ? { ...styles.tabStyle, width: (layout.width - ADD_BUTTON_WIDTH) / tabCount }
      : { ...styles.tabStyle, minWidth: layout.width / 3 - 14 };

  return (
    <View style={styles.container}>
      <TabBar
        {...({} as any)}
        {...props}
        style={styles.tabBarStyle}
        indicatorStyle={styles.indicatorStyle}
        tabStyle={tabStyle}
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
