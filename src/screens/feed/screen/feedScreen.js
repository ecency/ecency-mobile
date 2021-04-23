import React, { Fragment, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import get from 'lodash/get';

// Components
import { Posts, Header, TabbedPosts } from '../../../components';

// Container
import { AccountContainer } from '../../../containers';

// Styles
import styles from './feedStyles';

import {
  FEED_SUBFILTERS,
  FEED_SUBFILTERS_VALUE,
  FEED_SCREEN_FILTERS,
  FEED_SCREEN_FILTER_MAP,
  DEFAULT_FEED_FILTERS,
} from '../../../constants/options/filters';

const FeedScreen = () => {
  const feedScreenFilters = useSelector(
    (state) => state.posts.feedScreenFilters || DEFAULT_FEED_FILTERS,
  );
  const filterOptions = feedScreenFilters.map((key) => FEED_SCREEN_FILTER_MAP[key]);

  useEffect(() => {}, [feedScreenFilters]);

  return (
    <AccountContainer>
      {({ currentAccount }) => (
        <Fragment>
          <Header enableViewModeToggle={true} />
          <SafeAreaView style={styles.container}>
            <TabbedPosts
              filterOptions={filterOptions}
              filterOptionsValue={feedScreenFilters}
              getFor={get(currentAccount, 'name', null) ? 'feed' : 'hot'}
              selectedOptionIndex={get(currentAccount, 'name', null) ? 0 : 2}
              feedUsername={get(currentAccount, 'name', null)}
              isFeedScreen={true}
            />
          </SafeAreaView>
        </Fragment>
      )}
    </AccountContainer>
  );
};

export default FeedScreen;
