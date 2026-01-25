import { useState, useEffect } from 'react';

import { useNavigation } from '@react-navigation/native';
import ROUTES from '../constants/routeNames';

const AccountListContainer = ({ data, children }) => {
  const navigation = useNavigation();

  const [vdata, setVData] = useState(data);
  const [filterResult, setFilterResult] = useState(null);
  const [filterIndex, setFilterIndex] = useState(0);

  useEffect(() => {
    setVData(data);
  }, [data]);

  const _handleSearch = (searchText, key) => {
    const newData = vdata.filter((item) => {
      const itemName = item[key].toUpperCase();
      const _text = searchText.toUpperCase();

      return itemName.indexOf(_text) > -1;
    });

    if (filterIndex !== 0) {
      _handleOnVotersDropdownSelect(filterIndex, '', newData);
    } else {
      setFilterResult(newData);
    }
  };

  const _handleOnVotersDropdownSelect = (index, text, oldData) => {
    const _data = Object.assign([], oldData || vdata);
    const getRewardValue = (vote) => {
      const reward = Number(vote?.reward);
      if (!Number.isNaN(reward)) return reward;
      const rshares = Number(vote?.rshares);
      if (!Number.isNaN(rshares)) return rshares;
      const value = Number(vote?.value);
      if (!Number.isNaN(value)) return value;
      return 0;
    };
    const getPercentValue = (vote) => {
      const percent = Number(vote?.percent);
      if (!Number.isNaN(percent)) return percent;
      const percent100 = Number(vote?.percent100);
      if (!Number.isNaN(percent100)) return percent100 * 100;
      return 0;
    };
    const getTimeValue = (vote) => (vote?.time ? new Date(vote.time).getTime() : 0);

    if (filterIndex === index) {
      switch (index) {
        case 0:
          _data.sort((a, b) => getRewardValue(a) - getRewardValue(b));
          break;
        case 1:
          _data.sort((a, b) => getPercentValue(a) - getPercentValue(b));
          break;
        case 2:
          _data.sort((a, b) => getTimeValue(a) - getTimeValue(b));
          break;
        default:
          break;
      }
    } else {
      switch (index) {
        case 0:
          _data.sort((a, b) => getRewardValue(b) - getRewardValue(a));
          break;
        case 1:
          _data.sort((a, b) => getPercentValue(b) - getPercentValue(a));
          break;
        case 2:
          _data.sort((a, b) => getTimeValue(b) - getTimeValue(a));
          break;
        default:
          break;
      }
    }
    setFilterResult(_data);
    setFilterIndex(index);
  };

  const _handleOnUserPress = (username) => {
    navigation.navigate({
      name: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username,
    });
  };

  return (
    children &&
    children({
      data,
      filterResult,
      filterIndex,
      handleOnVotersDropdownSelect: _handleOnVotersDropdownSelect,
      handleSearch: _handleSearch,
      handleOnUserPress: _handleOnUserPress,
    })
  );
};

export default AccountListContainer;
