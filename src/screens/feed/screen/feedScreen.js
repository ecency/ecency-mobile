import React, { Fragment } from 'react';
import { SafeAreaView } from 'react-native';
import get from 'lodash/get';

// Components
import { Posts, Header } from '../../../components';

// Container
import { AccountContainer } from '../../../containers';

// Styles
import styles from './feedStyles';

import { POPULAR_FILTERS, POPULAR_FILTERS_VALUE } from '../../../constants/options/filters';

const FeedScreen = () => {
  return (
    <AccountContainer>
      {({ currentAccount, isLoggedIn }) => (
        <Fragment>
          <Header />
          <SafeAreaView style={styles.container}>
            <Posts
              filterOptions={[...POPULAR_FILTERS]}
              filterOptionsValue={[...POPULAR_FILTERS_VALUE]}
              getFor={isLoggedIn ? 'feed' : 'trending'}
              selectedOptionIndex={isLoggedIn ? 0 : 2}
              tag={get(currentAccount, 'name')}
            />
          </SafeAreaView>
        </Fragment>
      )}
    </AccountContainer>
  );
};

export default FeedScreen;
