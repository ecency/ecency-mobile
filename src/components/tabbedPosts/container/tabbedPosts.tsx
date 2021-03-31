import React, { useState } from 'react';
// import { Animated, View, TouchableOpacity, StyleSheet } from 'react-native';
// import { TabView, SceneMap } from 'react-native-tab-view';

// const FirstRoute = () => (
//   <View style={[styles.container, { backgroundColor: '#ff4081' }]} />
// );
// const SecondRoute = () => (
//   <View style={[styles.container, { backgroundColor: '#673ab7' }]} />
// );

export const TabbedPosts = () => {
  return null;
  //   const [state, setState] = useState({
  //       index: 0,
  //       routes: [
  //         { key: 'first', title: 'First' },
  //         { key: 'second', title: 'Second' },
  //       ],
  //     })

  // const _handleIndexChange = (index) => setState({...state, index });

  // const _renderTabBar = (props) => {
  //   const inputRange = props.navigationState.routes.map((x, i) => i);

  //   return (
  //     <View style={styles.tabBar}>
  //       {props.navigationState.routes.map((route, i) => {
  //         const opacity = props.position.interpolate({
  //           inputRange,
  //           outputRange: inputRange.map((inputIndex) =>
  //             inputIndex === i ? 1 : 0.5
  //           ),
  //         });

  //         return (
  //           <TouchableOpacity
  //             style={styles.tabItem}
  //             onPress={() => setState({...state, index: i })}>
  //             <Animated.Text style={{ opacity }}>{route.title}</Animated.Text>
  //           </TouchableOpacity>
  //         );
  //       })}
  //     </View>
  //   );
  // };

  // //routes will be build dynamically
  // const _renderScene = SceneMap({
  //   first: FirstRoute,
  //   second: SecondRoute,
  // });

 
  // //tab view will be the parent component 
  //   return (
  //     <TabView
  //       lazy={true}
  //       navigationState={state}
  //       renderScene={_renderScene}
  //       renderTabBar={_renderTabBar}
  //       onIndexChange={_handleIndexChange}
  //     />
  //   );
  // 
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   tabBar: {
//     flexDirection: 'row',
//   },
//   tabItem: {
//     flex: 1,
//     alignItems: 'center',
//     padding: 16,
//   },
// });
