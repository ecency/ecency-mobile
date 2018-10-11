import React, { PureComponent } from 'react';
import { Text, View, Dimensions } from 'react-native';
import ScrollableTabView from '@esteemapp/react-native-scrollable-tab-view';

// STEEM
import { getUserData, getAuthStatus } from '../../../realm/realm';
import { getUser } from '../../../providers/steem/dsteem';

// Components
import { TabBar } from '../../../components/tabBar';
import HotPage from '../hot';
import TrendingPage from '../trending';
import { Feed } from '../../../components/feed';

export default class HomeScreen extends PureComponent {
  constructor(props) {
    super(props);
    // Navigation.events().bindComponent(this); // <== Will be automatically unregistered when unmounted
    this.state = {
      user: {
        name: 'null',
      },
      isLoggedIn: false,
      isLoading: true,
      category: 'HOT',
      options: ['HOT', 'TRENDING', 'CLOSE'],
    };
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'search') {
      // Navigation.showOverlay({
      //   component: {
      //     name: 'navigation.eSteem.Search',
      //   },
      //   options: {
      //     overlay: {
      //       interceptTouchOutside: true,
      //     },
      //   },
      // });
    }
  }

  showActionSheet = () => {
    this.ActionSheet.show();
  };

  async componentDidMount() {
    let user;
    let userData;
    let isLoggedIn;

    await getAuthStatus().then((res) => {
      isLoggedIn = res;
    });

    if (isLoggedIn) {
      await getUserData().then((res) => {
        user = Array.from(res);
      });
      userData = await getUser(user[0].username);

      this.setState({
        user: userData,
        isLoggedIn,
        isLoading: false,
      });
    } else {
      await this.setState({
        isLoading: false,
      });
    }
  }

  render() {
    return (
      <View style={styles.root} key="overlay">
        <ScrollableTabView
          style={styles.tabView}
          renderTabBar={() => (
            <TabBar
              style={styles.tabbar}
              tabUnderlineDefaultWidth={80} // default containerWidth / (numberOfTabs * 4)
              tabUnderlineScaleX={2} // default 3
              activeColor="#357ce6"
              inactiveColor="#222"
              tabBarPosition="overlayTop"
            />
          )}
        >
          <View tabLabel="Feed" style={styles.tabbarItem}>
            {this.state.isLoggedIn ? (
              <Feed
                user={this.state.user}
                isLoggedIn={this.state.isLoggedIn}
                componentId={this.props.componentId}
              />
            ) : (
              <Text>Login to see your Feed</Text>
            )}
          </View>
          <View tabLabel="Hot" style={styles.tabbarItem}>
            <HotPage
              user={this.state.user}
              isLoggedIn={this.state.isLoggedIn}
              componentId={this.props.componentId}
            />
          </View>
          <View tabLabel="Popular" style={styles.tabbarItem}>
            <TrendingPage
              user={this.state.user}
              isLoggedIn={this.state.isLoggedIn}
              componentId={this.props.componentId}
            />
          </View>
        </ScrollableTabView>
        <View style={styles.buttonContainer} />
      </View>
    );
  }
}

const styles = {
  root: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  buttonContainer: {
    width: '50%',
    alignItems: 'center',
  },
  tabView: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  tabbar: {
    alignSelf: 'center',
    height: 40,
    backgroundColor: 'white',
  },
  tabbarItem: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    minWidth: Dimensions.get('window').width,
  },
  container: {
    backgroundColor: '#F9F9F9',
    flex: 1,
  },
  tabs: {
    flex: 1,
  },
  placeholder: {
    backgroundColor: 'white',
    padding: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderTopWidth: 1,
    borderColor: '#e2e5e8',
    borderRadius: 5,
    marginRight: 0,
    marginLeft: 0,
    marginTop: 10,
  },
  header: {
    backgroundColor: '#284b78',
    borderBottomWidth: 0,
    borderColor: '#284b78',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'white',
  },
  searchButton: {
    color: 'white',
    fontWeight: 'bold',
  },
  loginButton: {
    alignSelf: 'center',
    marginTop: 100,
  },
};
