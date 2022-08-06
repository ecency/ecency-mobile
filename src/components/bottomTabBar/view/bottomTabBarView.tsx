import React, { useEffect } from 'react';
import { SafeAreaView, View, TouchableOpacity } from 'react-native';


// Components
// import TabBar from './tabbar';

// Constants
import ROUTES from '../../../constants/routeNames';

// Styles
import styles from './bottomTabBarStyles';
import Icon, { IconContainer } from '../../icon';
import scalePx from '../../../utils/scalePx';
import { updateActiveBottomTab } from '../../../redux/actions/uiAction';


const BottomTabBarView = ({
  dispatch,
  state : { routes , index },
  navigation,
  activeTintColor,
  inactiveTintColor,
}) => {



  const _jumpTo = (route, isFocused, idx) => {

  
    if(route.name === ROUTES.TABBAR.POST_BUTTON){
      navigation.navigate(ROUTES.SCREENS.POST, {key: 'editor_post'})
      return;
    }


    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    })

    //TODO: also enable tap to scroll up feature
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }

    dispatch(updateActiveBottomTab(routes[idx].name))

  };


  const _tabButtons = routes.map((route, idx) => {
    const isFocused = index == idx;
    const iconColor = isFocused ? activeTintColor : inactiveTintColor

    let _iconProps = {
      iconType:"MaterialIcons",
        style:{ padding: 15 },
        name:route.params.iconName,
        color:iconColor,
        size:scalePx(26),
    }

    let _tabBarIcon = <Icon {..._iconProps}/>
    switch (route.name) {
      case ROUTES.TABBAR.NOTIFICATION:
        _tabBarIcon = (<IconContainer 
          isBadge badgeType="notification"  {..._iconProps}/>)
        break;
      case ROUTES.TABBAR.POST_BUTTON:
        _iconProps.iconType = "MaterialCommunityIcons"
        _tabBarIcon = <Icon {..._iconProps} />
        break;
    }

    return (
      <View key={route.key} style={{ flex: 1, alignItems: 'center' }}>
        <TouchableOpacity onPress={() => _jumpTo(route, isFocused, idx)}>
          {_tabBarIcon}
        </TouchableOpacity>
      </View>
    )
  })


  return (
    <SafeAreaView style={styles.wrapper}>
      {_tabButtons}
    </SafeAreaView>
  );
};

export default BottomTabBarView;
