import React, { Fragment } from 'react';
import { SafeAreaView } from 'react-native';
import get from 'lodash/get';

// Components
import { Posts, Header } from '../../../components';

// Container
import { AccountContainer } from '../../../containers';

// Styles
import styles from './feedStyles';

import { POPULAR_FILTERS, PROFILE_FILTERS } from '../../../constants/options/filters';

const FeedScreen = () => {
  return (
    <AccountContainer>
      {({ currentAccount, isLoggedIn }) => (
        <Fragment>
          <Header />
          <SafeAreaView style={styles.container}>
            <Posts
              filterOptions={[...PROFILE_FILTERS, ...POPULAR_FILTERS]}
              getFor={isLoggedIn ? 'feed' : 'trending'}
              selectedOptionIndex={isLoggedIn ? 1 : 2}
              tag={get(currentAccount, 'name')}
            />
          </SafeAreaView>
        </Fragment>
      )}
    </AccountContainer>
  );
};

export default FeedScreen;
