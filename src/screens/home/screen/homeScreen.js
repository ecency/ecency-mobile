import React, { PureComponent, Fragment } from 'react';
import { View } from 'react-native';
import ScrollableTabView from '@esteemapp/react-native-scrollable-tab-view';

// STEEM

// Components
import { TabBar } from '../../../components/tabBar';
import { Posts } from '../../../components/posts';
import { Header } from '../../../components/header';
// Styles
import styles from './homeStyles';

export default class HomeScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { componentId, isLoggedIn, currentAccount } = this.props;
    const _filterOptions = [
      'FEED',
      'TRENDING',
      'HOT',
      'NEW',
      'ACTIVE',
      'PROMOTED',
      'VOTES',
      'COMMENTS',
      'PAYOUT',
    ];

    return (
      <Fragment>
        <Header />
        <View style={styles.container} key="overlay">
          <ScrollableTabView
            style={styles.tabView}
            renderTabBar={() => (
              <TabBar
                style={styles.tabbar}
                tabUnderlineDefaultWidth={80}
                tabUnderlineScaleX={2}
                tabBarPosition="overlayTop"
              />
            )}
          >
            <View tabLabel="Feed" style={styles.tabbarItem}>
              <Posts
                filterOptions={_filterOptions}
                getFor="feed"
                tag={isLoggedIn ? currentAccount.name : 'esteemapp'}
                user={currentAccount}
                isLoggedIn={isLoggedIn}
                componentId={componentId}
              />
            </View>
            <View tabLabel="Popular" style={styles.tabbarItem}>
              <Posts
                filterOptions={_filterOptions}
                getFor="trending"
                user={currentAccount}
                isLoggedIn={isLoggedIn}
                componentId={componentId}
              />
            </View>
          </ScrollableTabView>
        </View>
      </Fragment>
    );
  }
}
