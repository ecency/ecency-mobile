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

import {filters, profile_filters} from '../../../constants/options/filters';


class HomeScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      currentAccount, intl, isLoggedIn, isLoginDone,
    } = this.props;
    const _filterOptions = [
      'NEW POSTS',
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

    if (isLoginDone && !isLoggedIn) {
      // tag = 'esteemapp';
    }

    return (
      <Fragment>
        <Header />
        <View style={styles.container}>
          <ScrollableTabView
            style={styles.tabView}
            activeTab={!isLoggedIn ? 1 : 0}
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
                filterOptions={profile_filters}
                getFor={profile_filters[1].toLowerCase()}
                tag={tag || currentAccount.name}
                selectedOptionIndex={1}
                pageType="profiles"
              />
            </View>
            <View
              tabLabel={intl.formatMessage({
                id: 'home.popular',
              })}
              style={styles.tabbarItem}
            >
              <Posts filterOptions={filters} getFor={filters[0].toLowerCase()} selectedOptionIndex={0} pageType="posts" />
            </View>
          </ScrollableTabView>
        </View>
      </Fragment>
    );
  }
}

export default injectIntl(HomeScreen);
