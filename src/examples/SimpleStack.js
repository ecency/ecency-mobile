import {
  NavigationScreenProp,
  NavigationState,
  NavigationStateRoute,
  NavigationEventSubscription,
} from 'react-navigation';

import * as React from 'react';
import { ScrollView, Text, StatusBar } from 'react-native';

import FeedPage from '../screens/home/feed';

import {
  createStackNavigator,
  SafeAreaView,
  withNavigation,
  NavigationActions,
  StackActions,
} from 'react-navigation';
import invariant from 'invariant';

import SampleText from './SampleText';

class BackButton extends React.Component {
  render() {
    return (
      <Text>Test</Text>
    );
  }

  _navigateBack = () => {
    this.props.navigation.goBack(null);
  };
}

const BackButtonWithNavigation = withNavigation(BackButton);

class MyNavScreen extends React.Component {
  render() {
    const { navigation, banner } = this.props;
    const { push, replace, popToTop, pop, dismiss } = navigation;
    invariant(
      push && replace && popToTop && pop && dismiss,
      'missing action creators for StackNavigator'
    );
    return (
      <SafeAreaView>
        <SampleText>{banner}</SampleText>
        <Button
          onPress={() => push('Profile', { name: 'Jane' })}
          title="Push a profile screen"
        />
        <Button
          onPress={() =>
            navigation.dispatch(
              StackActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({
                    routeName: 'Photos',
                    params: { name: 'Jane' },
                  }),
                ],
              })
            )
          }
          title="Reset photos"
        />
        <Button
          onPress={() => navigation.navigate('Photos', { name: 'Jane' })}
          title="Navigate to a photos screen"
        />
        <Button
          onPress={() => replace('Profile', { name: 'Lucy' })}
          title="Replace with profile"
        />
        <Button onPress={() => popToTop()} title="Pop to top" />
        <Button onPress={() => pop()} title="Pop" />
        <Button
          onPress={() => {
            if (navigation.goBack()) {
              console.log('goBack handled');
            } else {
              console.log('goBack unhandled');
            }
          }}
          title="Go back"
        />
        <Button onPress={() => dismiss()} title="Dismiss" />
        <StatusBar barStyle="default" />
      </SafeAreaView>
    );
  }
}

class MyPhotosScreen extends React.Component {
  static navigationOptions = {
    title: 'Photos',
    headerLeft: <BackButtonWithNavigation />,
  };
  _s0;
  _s1;
  _s2;
  _s3;

  componentDidMount() {
    this._s0 = this.props.navigation.addListener('willFocus', this._onWF);
    this._s1 = this.props.navigation.addListener('didFocus', this._onDF);
    this._s2 = this.props.navigation.addListener('willBlur', this._onWB);
    this._s3 = this.props.navigation.addListener('didBlur', this._onDB);
  }
  componentWillUnmount() {
    this._s0.remove();
    this._s1.remove();
    this._s2.remove();
    this._s3.remove();
  }
  _onWF = a => {
    console.log('_willFocus PhotosScreen', a);
  };
  _onDF = a => {
    console.log('_didFocus PhotosScreen', a);
  };
  _onWB = a => {
    console.log('_willBlur PhotosScreen', a);
  };
  _onDB = a => {
    console.log('_didBlur PhotosScreen', a);
  };

  render() {
    const { navigation } = this.props;
    return (
      <MyNavScreen
        banner={`${navigation.getParam('name')}'s Photos`}
        navigation={navigation}
      />
    );
  }
}

const MyProfileScreen = ({ navigation }) => (
  <MyNavScreen
    banner={`${
      navigation.getParam('mode') === 'edit' ? 'Now Editing ' : ''
    }${navigation.getParam('name')}'s Profile`}
    navigation={navigation}
  />
);

MyProfileScreen.navigationOptions = props => {
  const { navigation } = props;
  const { state, setParams } = navigation;
  const { params } = state;
  return {
    headerBackImage: params.headerBackImage,
    headerTitle: `${params.name}'s Profile!`,
    // Render a button on the right side of the header.
    // When pressed switches the screen to edit mode.
    headerRight: (
      <HeaderButtons>
        <HeaderButtons.Item
          title={params.mode === 'edit' ? 'Done' : 'Edit'}
          onPress={() =>
            setParams({ mode: params.mode === 'edit' ? '' : 'edit' })
          }
        />
      </HeaderButtons>
    ),
  };
};

const SimpleStack = createStackNavigator({
  Home: {
    screen: FeedPage,
  },
  Profile: {
    path: 'people/:name',
    screen: MyProfileScreen,
  },
  Photos: {
    path: 'photos/:name',
    screen: MyPhotosScreen,
  },
});

export default SimpleStack;
