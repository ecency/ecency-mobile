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
  FEED_SCREEN_FILTER_MAP,
  DEFAULT_FEED_FILTERS,
} from '../../../constants/options/filters';
import { useAppSelector } from '../../../hooks';

const FeedScreen = () => {

  const mainTabs = useAppSelector((state) => state.customTabs.mainTabs || DEFAULT_FEED_FILTERS);
  const filterOptions = mainTabs.map((key) => FEED_SCREEN_FILTER_MAP[key]);

  return (
    <AccountContainer>
      {({ currentAccount }) => (
        <Fragment>
          <Header enableViewModeToggle={true} />
          <SafeAreaView style={styles.container}>
            <TabbedPosts
              key={JSON.stringify(filterOptions)} //this hack of key change resets tabbedposts whenever filters chanage, effective to remove filter change android bug
              filterOptions={filterOptions}
              filterOptionsValue={mainTabs}
              getFor={get(currentAccount, 'name', null) ? 'feed' : 'hot'}
              selectedOptionIndex={get(currentAccount, 'name', null) ? 0 : 2}
              feedUsername={get(currentAccount, 'name', null)}
              isFeedScreen={true}
              pageType='main'
            />
          </SafeAreaView>
        </Fragment>
      )}
    </AccountContainer>
  );
};

export default FeedScreen;
