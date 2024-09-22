import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import get from 'lodash/get';

// Components
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Header, TabbedPosts } from '../../../components';

// Styles
import styles from './feedStyles';

import { getFilterMap, DEFAULT_FEED_FILTERS, GUEST_FEED_FILTERS } from '../../../constants/options/filters';

import { useAppSelector } from '../../../hooks';
import CommentsTabContent from '../../../components/profile/children/commentsTabContent';

const FeedScreen = () => {
  const isLoggedIn = useAppSelector(state => state.application.isLoggedIn);
  const currentAccount = useAppSelector(
    (state) => state.account.currentAccount,
  );

  const mainTabs = useAppSelector(
    (state) => state.customTabs.mainTabs,
  );


  const [lazyLoad, setLazyLoad] = useState(false);
  const [tabContentOverrides, setTabContentOverrides] = useState(new Map());

  const _lazyLoadContent = () => {
    if (!lazyLoad) {
      setTimeout(() => {
        setLazyLoad(true);
      }, 100);
    }
  };


  const filterOptionsValue = useMemo(() =>
    isLoggedIn ? mainTabs || DEFAULT_FEED_FILTERS : GUEST_FEED_FILTERS
    , [isLoggedIn, mainTabs])

  const filterOptions = filterOptionsValue.map((key) => getFilterMap('main')[key]);

  useEffect(() => {
    if (lazyLoad && filterOptionsValue.indexOf('comments') >= 0) {
      tabContentOverrides.set(filterOptionsValue.indexOf('comments'), _contentComentsTab('comments'));
      setTabContentOverrides(new Map(tabContentOverrides));
    }

  }, [lazyLoad, filterOptionsValue])






  //render comments if tab is selected
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



  return (
    <Fragment>
      <Header showQR={true} showBoost={true} />
      <View style={styles.container} onLayout={_lazyLoadContent}>
        {lazyLoad && (
          <TabbedPosts
            key={JSON.stringify(filterOptions)} // this hack of key change resets tabbedposts whenever filters chanage, effective to remove filter change android bug
            filterOptions={filterOptions}
            filterOptionsValue={filterOptionsValue}
            selectedOptionIndex={0}
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
