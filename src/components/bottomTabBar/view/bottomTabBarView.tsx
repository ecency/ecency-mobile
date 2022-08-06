import React from 'react';
import { SafeAreaView, View, TouchableOpacity } from 'react-native';


// Components
// import TabBar from './tabbar';

// Constants
import ROUTES from '../../../constants/routeNames';

// Styles
import styles from './bottomTabBarStyles';
import Icon, { IconContainer } from '../../icon';
import scalePx from '../../../utils/scalePx';



const BottomTabBarView = ({
  state, descriptors, navigation,
  activeTintColor,
  inactiveTintColor,
}) => {

  // const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(updateActiveBottomTab(routes[index].routeName));
  // }, [dispatch, index, routes]);

  const { routes, index } = state;

  const _jumpTo = (route, isFocused) => {

    if(route.name === ROUTES.TABBAR.POST_BUTTON){
      navigation.navigate(ROUTES.SCREENS.POST, {key: 'editor_post'})
      return;
    }

    //TOOD: listen to tabPress event and change updateActiveBottomTab, preferrably in application container
    //TODO: also enable tap to scroll up feature
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    })

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }

  };


  const _tabButtons = routes.map((route, idx) => {
    const isFocused = state.index == idx;
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
        <TouchableOpacity onPress={() => _jumpTo(route, isFocused)}>
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
