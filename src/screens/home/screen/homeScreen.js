import React, { PureComponent, Fragment } from 'react';
import { View } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { injectIntl } from 'react-intl';

// Components
import { TabBar } from '../../../components/tabBar';
import { Posts } from '../../../components/posts';
import { Header } from '../../../components/header';

// Styles
import styles from './homeStyles';
import globalStyles from '../../../globalStyles';

import { POPULAR_FILTERS, PROFILE_FILTERS } from '../../../constants/options/filters';

class HomeScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { currentAccount, intl, isLoggedIn } = this.props;

    let tag;

    return (
      <Fragment>
        <Header />
        <View style={styles.container}>
          <ScrollableTabView
            style={globalStyles.tabView}
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
                filterOptions={PROFILE_FILTERS}
                getFor={PROFILE_FILTERS[1].toLowerCase()}
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
              <Posts
                filterOptions={POPULAR_FILTERS}
                getFor={POPULAR_FILTERS[0].toLowerCase()}
                selectedOptionIndex={0}
                pageType="posts"
              />
            </View>
          </ScrollableTabView>
        </View>
      </Fragment>
    );
  }
}

export default injectIntl(HomeScreen);
