import React from 'react';
import { Route, TabBarProps, TabBar as TabBarView } from 'react-native-tab-view';
import styles from './tabBar.styles';

const TabBar = <T extends Route>(props: TabBarProps<T>) => {
  return (
    <TabBarView
      {...props}
      style={styles.tabbar}
      indicatorStyle={styles.tabbarIndicator}
      labelStyle={styles.tabbarLabel}
    />
  );
};

export default TabBar;
