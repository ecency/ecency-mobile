import { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';

import ROUTES from '../../../constants/routeNames';

import {
  getCommunities,
  getSubscriptions,
  subscribeCommunity,
} from '../../../providers/hive/dhive';

const DEFAULT_COMMUNITIES = [
  'hive-125125',
  'hive-174301',
  'hive-140217',
  'hive-179017',
  'hive-160545',
  'hive-194913',
  'hive-166847',
  'hive-176853',
  'hive-183196',
  'hive-163772',
  'hive-106444',
];

const CommunitiesContainer = ({
  children,
  navigation,
  searchValue,
  currentAccount,
  pinCode,
  isLoggedIn,
}) => {
  const [data, setData] = useState(DEFAULT_COMMUNITIES);
  const [allSubscriptions, setAllSubscriptions] = useState([]);

  useEffect(() => {
    if (searchValue !== '') {
      getCommunities('', 100, searchValue, 'rank').then(setData);
    }
  }, [searchValue]);

  // Component Functions
  const _handleOnPress = (name) => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.COMMUNITY,
      params: {
        tag: name,
      },
    });
  };

  const _handleSubscribeButtonPress = (_data) => {
    return subscribeCommunity(currentAccount, pinCode, _data);
  };

  return (
    children &&
    children({
      data,
      allSubscriptions,
      handleOnPress: _handleOnPress,
      handleSubscribeButtonPress: _handleSubscribeButtonPress,
      isLoggedIn,
    })
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  isLoggedIn: state.application.isLoggedIn,
});

export default connect(mapStateToProps)(withNavigation(CommunitiesContainer));
