import React, { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';

// Constants
import { useDispatch } from 'react-redux';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ROUTES from '../../../constants/routeNames';

// Styles
import styles from './bottomTabBarStyles';
import Icon, { IconContainer } from '../../icon';
import { updateActiveBottomTab } from '../../../redux/actions/uiAction';

const BottomTabBarView = ({
  state: { routes, index },
  navigation,
  descriptors,
}: BottomTabBarProps) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();


  useEffect(() => {
    dispatch(updateActiveBottomTab(routes[index].name));
  }, [index]);

  const _jumpTo = (route, isFocused) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    // TODO: also enable tap to scroll up feature
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const _tabButtons = routes.map((route, idx) => {
    const { tabBarActiveTintColor, tabBarInactiveTintColor } = descriptors[route.key].options;
    const isFocused = index == idx;
    const iconColor = isFocused ? tabBarActiveTintColor : tabBarInactiveTintColor;

    const _iconProps = {
      iconType: 'MaterialIcons',
      style: { paddingTop: 15 },
      name: route.params.iconName,
      color: iconColor,
      size: 26,
    };

    let _tabBarIcon = <Icon {..._iconProps} />;
    switch (route.name) {
      case ROUTES.TABBAR.NOTIFICATION:
        _tabBarIcon = <IconContainer isBadge badgeType="notification" {..._iconProps} />;
        break;
      case ROUTES.TABBAR.CHATS:
        _tabBarIcon = <IconContainer isBadge badgeType="chat" {..._iconProps} />;
        break;
      case ROUTES.TABBAR.WAVES:
        _iconProps.iconType = 'MaterialCommunityIcons';
        _tabBarIcon = <Icon {..._iconProps} />;
        break;
    }

    return (
      <View key={route.key} style={{ flex: 1, alignItems: 'center' }}>
        <TouchableOpacity onPress={() => _jumpTo(route, isFocused)}>{_tabBarIcon}</TouchableOpacity>
      </View>
    );
  });

  const _bottomPadding = insets.bottom || 16;

  return (
    <View style={[styles.wrapper, { paddingBottom: _bottomPadding }]}>
      {_tabButtons}

    </View>
  );
};

export default BottomTabBarView;
