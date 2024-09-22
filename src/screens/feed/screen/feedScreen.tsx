import React, { Fragment, useEffect, useState } from 'react';
import { View } from 'react-native';
import get from 'lodash/get';

// Components
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Header, TabbedPosts } from '../../../components';

// Styles
import styles from './feedStyles';

import { getDefaultFilters, getFilterMap } from '../../../constants/options/filters';

import { useAppSelector } from '../../../hooks';
import CommentsTabContent from '../../../components/profile/children/commentsTabContent';

const FeedScreen = () => {
  const currentAccount = useAppSelector(
    (state) => state.account.currentAccount,
  );
  const mainTabs = useAppSelector(
    (state) => state.customTabs.mainTabs || getDefaultFilters('main'),
  );
  const filterOptions = mainTabs.map((key) => getFilterMap('main')[key]);

  const [lazyLoad, setLazyLoad] = useState(false);
  const [tabContentOverrides, setTabContentOverrides] = useState(new Map());

  const _lazyLoadContent = () => {
    if (!lazyLoad) {
      setTimeout(() => {
        setLazyLoad(true);
      }, 100);
    }
  };


  useEffect(() => {
    if (lazyLoad && mainTabs.indexOf('comments') >= 0) {
      tabContentOverrides.set(mainTabs.indexOf('comments'), _contentComentsTab('comments'));
      setTabContentOverrides(new Map(tabContentOverrides));
    }

  }, [lazyLoad, mainTabs])


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
            filterOptionsValue={mainTabs}
            selectedOptionIndex={get(currentAccount, 'name', null) ? 0 : 2}
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
