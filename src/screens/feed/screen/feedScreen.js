import React, { Fragment } from 'react';
import { SafeAreaView } from 'react-native';
import get from 'lodash/get';

// Components
import { Posts, Header, TabbedPosts } from '../../../components';

// Container
import { AccountContainer } from '../../../containers';

// Styles
import styles from './feedStyles';

import {
  POPULAR_FILTERS,
  POPULAR_FILTERS_VALUE,
  FEED_SUBFILTERS,
  FEED_SUBFILTERS_VALUE,
} from '../../../constants/options/filters';

const FeedScreen = () => {
  return (
    <AccountContainer>
      {({ currentAccount }) => (
        <Fragment>
          <Header />
          <SafeAreaView style={styles.container}>
            <TabbedPosts
              filterOptions={[...POPULAR_FILTERS]}
              filterOptionsValue={[...POPULAR_FILTERS_VALUE]}
              feedSubfilterOptions={[...FEED_SUBFILTERS]}
              feedSubfilterOptionsValue={[...FEED_SUBFILTERS_VALUE]}
              getFor={get(currentAccount, 'name', null) ? 'feed' : 'hot'}
              selectedOptionIndex={get(currentAccount, 'name', null) ? 0 : 2}
              feedUsername={get(currentAccount, 'name', null)}
              isFeedScreen={true}
            />
            {/* <Posts
              filterOptions={[...POPULAR_FILTERS]}
              filterOptionsValue={[...POPULAR_FILTERS_VALUE]}
              feedSubfilterOptions={[...FEED_SUBFILTERS]}
              feedSubfilterOptionsValue={[...FEED_SUBFILTERS_VALUE]}
              getFor={get(currentAccount, 'name', null) ? 'feed' : 'hot'}
              selectedOptionIndex={get(currentAccount, 'name', null) ? 0 : 2}
              feedUsername={get(currentAccount, 'name', null)}
              isFeedScreen={true}
            /> */}
          </SafeAreaView>
        </Fragment>
      )}
    </AccountContainer>
  );
};

export default FeedScreen;
