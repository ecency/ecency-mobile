import { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';

import ROUTES from '../../../constants/routeNames';

import {
  subscribeCommunity,
  getCommunities,
  getSubscriptions,
} from '../../../providers/hive/dhive';

const CommunitiesContainer = ({
  children,
  navigation,
  searchValue,
  currentAccount,
  pinCode,
  isLoggedIn,
}) => {
  const [data, setData] = useState();
  const [filterIndex, setFilterIndex] = useState(1);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('rank');
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [noResult, setNoResult] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setData([]);
    if (sort === 'my') {
      setNoResult(true);
    } else {
      getCommunities('', 100, query, sort).then((res) => {
        if (!isCancelled) {
          if (!isEmpty(res)) {
            setData(res);
            setNoResult(false);
          } else {
            setNoResult(true);
          }
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [query, sort]);

  useEffect(() => {
    setData([]);
    setQuery(searchValue);
    setNoResult(false);
  }, [searchValue]);

  useEffect(() => {
    let isCancelled = false;
    if (data && !isCancelled) {
      getSubscriptions(currentAccount.username).then((result) => {
        if (result) {
          setAllSubscriptions(result);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [data]);

  // Component Functions
  const _handleOnVotersDropdownSelect = (index, value) => {
    setFilterIndex(index);
    setSort(value);
  };

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
      filterIndex,
      allSubscriptions,
      handleOnVotersDropdownSelect: _handleOnVotersDropdownSelect,
      handleOnPress: _handleOnPress,
      handleSubscribeButtonPress: _handleSubscribeButtonPress,
      isLoggedIn,
      noResult,
    })
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  isLoggedIn: state.application.isLoggedIn,
});

export default connect(mapStateToProps)(withNavigation(CommunitiesContainer));
