import React, { PureComponent, Fragment } from 'react';
import { Text, View } from 'react-native';
import ScrollableTabView from '@esteemapp/react-native-scrollable-tab-view';

// STEEM
import { getUserData, getAuthStatus } from '../../../realm/realm';
import { getUser } from '../../../providers/steem/dsteem';

// Components
import { TabBar } from '../../../components/tabBar';
import { Posts } from '../../../components/posts';
import { Header } from '../../../components/header';
// Styles
import styles from './homeStyles';

export default class HomeScreen extends PureComponent {
  constructor(props) {
    super(props);
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
    const { user, isLoggedIn } = this.state;
    const { componentId } = this.props;
    return (
      <Fragment>
        <Header userName={user.name} />
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
              {isLoggedIn ? (
                <Posts
                  isLoginMust
                  getFor="feed"
                  tag={user.name}
                  user={user}
                  isLoggedIn={isLoggedIn}
                  componentId={componentId}
                />
              ) : (
                <Text>Login to see your Feed</Text>
              )}
            </View>
            <View tabLabel="Hot" style={styles.tabbarItem}>
              <Posts getFor="hot" user={user} isLoggedIn={isLoggedIn} componentId={componentId} />
            </View>
            <View tabLabel="Popular" style={styles.tabbarItem}>
              <Posts
                getFor="trending"
                user={user}
                isLoggedIn={isLoggedIn}
                componentId={componentId}
              />
            </View>
          </ScrollableTabView>
          <View style={styles.buttonContainer} />
        </View>
      </Fragment>
    );
  }
}
