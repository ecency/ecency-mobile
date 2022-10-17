import React, { Fragment, useState, useEffect } from 'react';
import { ActivityIndicator, SafeAreaView } from 'react-native';
import get from 'lodash/get';

// Components
import { Header, TabbedPosts } from '../../../components';

// Container
import { AccountContainer } from '../../../containers';

// Styles
import styles from './feedStyles';

import { getDefaultFilters, getFilterMap } from '../../../constants/options/filters';

import { useAppSelector } from '../../../hooks';

const FeedScreen = () => {
  const mainTabs = useAppSelector(
    (state) => state.customTabs.mainTabs || getDefaultFilters('main'),
  );
  const filterOptions = mainTabs.map((key) => getFilterMap('main')[key]);

  const [lazyLoad, setLazyLoad] = useState(false);

  const _lazyLoadContent = () => {
    if (!lazyLoad) {
      setTimeout(() => {
        setLazyLoad(true);
      }, 100);
    }
  };

  return (
    <AccountContainer>
      {({ currentAccount }) => (
        <Fragment>
          <Header showQR={true} />
          <SafeAreaView style={styles.container} onLayout={_lazyLoadContent}>
            {lazyLoad && (
              <TabbedPosts
                key={JSON.stringify(filterOptions)} //this hack of key change resets tabbedposts whenever filters chanage, effective to remove filter change android bug
                filterOptions={filterOptions}
                filterOptionsValue={mainTabs}
                getFor={get(currentAccount, 'name', null) ? 'feed' : 'hot'}
                selectedOptionIndex={get(currentAccount, 'name', null) ? 0 : 2}
                feedUsername={get(currentAccount, 'name', null)}
                isFeedScreen={true}
                pageType="main"
              />
            )}
          </SafeAreaView>
        </Fragment>
      )}
    </AccountContainer>
  );
};

export default FeedScreen;
