import { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

import ROUTES from '../../../constants/routeNames';

import { getCommunities, getSubscriptions } from '../../../providers/steem/steem';
import { subscribeCommunity } from '../../../providers/steem/dsteem';

const CommunitiesContainer = ({ children, navigation, searchValue, currentAccount, pinCode }) => {
  const [data, setData] = useState();
  const [filterIndex, setFilterIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('rank');
  const [allSubscriptions, setAllSubscriptions] = useState([]);

  useEffect(() => {
    setData([]);
    getCommunities('', 100, query, sort).then((res) => {
      if (res) {
        setData(res);
      }
    });
  }, [query, sort]);

  useEffect(() => {
    setData([]);
    setQuery(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (data) {
      getSubscriptions(currentAccount.username).then((result) => {
        setAllSubscriptions(result);
      });
    }
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
    })
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
});

export default connect(mapStateToProps)(withNavigation(CommunitiesContainer));
