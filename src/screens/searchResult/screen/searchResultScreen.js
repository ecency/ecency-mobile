import React, { PureComponent } from 'react';
import { View, SafeAreaView } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { injectIntl } from 'react-intl';

// Components
import { SearchInput, Posts, TabBar } from '../../../components';

// Styles
import styles from './searchResultStyles';
import globalStyles from '../../../globalStyles';

import {
  POPULAR_FILTERS,
  PROFILE_FILTERS,
  PROFILE_FILTERS_VALUE,
  POPULAR_FILTERS_VALUE,
} from '../../../constants/options/filters';

class SearchResultScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { intl, tag, navigationGoBack } = this.props;

    return (
      <View style={styles.container}>
        <SafeAreaView>
          <SearchInput
            onChangeText={() => {}}
            handleOnModalClose={navigationGoBack}
            placeholder={`#${tag}`}
            editable={false}
          />
        </SafeAreaView>
        <ScrollableTabView
          style={globalStyles.tabView}
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
              id: 'search.posts',
            })}
            style={styles.tabbarItem}
          >
            <Posts
              key={tag}
              filterOptions={POPULAR_FILTERS}
              filterOptionsValue={POPULAR_FILTERS_VALUE}
              tag={tag}
            />
          </View>
        </ScrollableTabView>
      </View>
    );
  }
}

export default injectIntl(SearchResultScreen);
