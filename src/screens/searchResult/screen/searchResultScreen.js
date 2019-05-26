import React, { PureComponent } from 'react';
import { View } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { injectIntl } from 'react-intl';

// Components
import { TabBar } from '../../../components/tabBar';
import { Posts } from '../../../components/posts';
import SearchInput from '../../../components/searchInput';

// Styles
import styles from './searchResultStyles';
import globalStyles from '../../../globalStyles';

class SearchResultScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { intl, tag, navigationGoBack } = this.props;

    return (
      <View style={styles.container}>
        <SearchInput
          onChangeText={() => {}}
          handleOnModalClose={navigationGoBack}
          placeholder={`#${tag}`}
          editable={false}
        />
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
            <Posts pageType="posts" tag={tag} />
          </View>
          {/* <View
              tabLabel={intl.formatMessage({
                id: 'search.comments',
              })}
              style={styles.tabbarItem}
            >
              <Posts
                filterOptions={POPULAR_FILTERS}
                getFor={POPULAR_FILTERS[0].toLowerCase()}
                selectedOptionIndex={0}
                pageType="posts"
              />
            </Fragment> */}
        </ScrollableTabView>
      </View>
    );
  }
}

export default injectIntl(SearchResultScreen);
