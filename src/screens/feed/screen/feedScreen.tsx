import React, { Fragment, useMemo, useState } from 'react';
import { View } from 'react-native';
import get from 'lodash/get';

// Components
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Header, TabbedPosts } from '../../../components';

// Styles
import styles from './feedStyles';

import {
  DEFAULT_FEED_FILTERS,
  GUEST_FEED_FILTERS,
  FEED_SCREEN_FILTER_MAP,
} from '../../../constants/options/filters';

import { useAppSelector } from '../../../hooks';
import CommentsTabContent from '../../../components/profile/children/commentsTabContent';
import { TabItem } from '../../../components/tabbedPosts/types/tabbedPosts.types';

const FeedScreen = () => {
  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const mainTabs = useAppSelector((state) => state.customTabs.mainTabs);

  const [lazyLoad, setLazyLoad] = useState(false);

  const _lazyLoadContent = () => {
    if (!lazyLoad) {
      setTimeout(() => {
        setLazyLoad(true);
      }, 100);
    }
  };

  const feedFilters = useMemo(
    () => (isLoggedIn ? mainTabs || DEFAULT_FEED_FILTERS : GUEST_FEED_FILTERS),
    [isLoggedIn, mainTabs],
  );

  const tabFilters = useMemo(
    () =>
      feedFilters.map(
        (key: string) =>
          ({
            filterKey: key,
            label: FEED_SCREEN_FILTER_MAP[key],
          } as TabItem),
      ),
    [feedFilters],
  );

  // render comments if tab is selected
  const _contentComentsTab = (type: 'comments' | 'replies') => {
    return (
      <CommentsTabContent
        username={currentAccount.username}
        selectedUser={currentAccount.username}
        isOwnProfile={true}
        type={type}
      />
    );
  };

  const tabContentOverrides = useMemo(
    () =>
      feedFilters.indexOf('comments') >= 0
        ? new Map([[feedFilters.indexOf('comments'), _contentComentsTab('comments')]])
        : undefined,
    [feedFilters],
  );

  return (
    <Fragment>
      <Header showQR={true} showBoost={true} />
      <View style={styles.container} onLayout={_lazyLoadContent}>
        {lazyLoad && (
          <TabbedPosts
            key={JSON.stringify(feedFilters)} // this hack of key change resets tabbedposts whenever filters chanage, effective to remove filter change android bug
            tabFilters={tabFilters}
            selectedOptionIndex={isLoggedIn ? 0 : 1}
            feedUsername={get(currentAccount, 'name', null)}
            tabContentOverrides={tabContentOverrides}
            isFeedScreen={true}
            pageType="main"
          />
        )}
      </View>
    </Fragment>
  );
};

export default gestureHandlerRootHOC(FeedScreen);
