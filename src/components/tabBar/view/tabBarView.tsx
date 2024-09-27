import React from 'react';
import styles from './tabBar.styles';
import { Route, TabBarProps, TabBar as TabBarView } from 'react-native-tab-view';


const TabBar = <T extends Route>(props:TabBarProps<T>) => {
  return (
    <TabBarView
      {...props}
      style={styles.tabbar}
      indicatorStyle={styles.tabbarIndicator}
      labelStyle={styles.tabbarLabel} />
  )
}

export default TabBar;



