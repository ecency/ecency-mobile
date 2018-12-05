import React, { PureComponent, Fragment } from 'react';
import { View } from 'react-native';
import ScrollableTabView from '@esteemapp/react-native-scrollable-tab-view';
import { injectIntl } from 'react-intl';

// STEEM

// Components
import { TabBar } from '../../../components/tabBar';
import { Posts } from '../../../components/posts';
import { Header } from '../../../components/header';
// Styles
import styles from './homeStyles';

class HomeScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { isLoggedIn, currentAccount, intl } = this.props;
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
    let tag;

    if (!isLoggedIn || (!currentAccount && !currentAccount.name)) {
      tag = 'esteemapp';
    }

    return (
      <Fragment>
        <Header />

        <View style={styles.container}>
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
            <View
              tabLabel={intl.formatMessage({
                id: 'home.feed',
              })}
              style={styles.tabbarItem}
            >
              <Posts
                filterOptions={_filterOptions}
                getFor="feed"
                tag={tag || currentAccount.name}
                user={currentAccount}
                isLoggedIn={isLoggedIn}
              />
            </View>
            <View
              tabLabel={intl.formatMessage({
                id: 'home.popular',
              })}
              style={styles.tabbarItem}
            >
              <Posts
                filterOptions={_filterOptions}
                getFor="trending"
                user={currentAccount}
                isLoggedIn={isLoggedIn}
              />
            </View>
          </ScrollableTabView>
        </View>
      </Fragment>
    );
  }
}

export default injectIntl(HomeScreen);
