import { useState, useEffect } from 'react';

import { useNavigation } from '@react-navigation/native';
import ROUTES from '../constants/routeNames';

const AccountListContainer = ({ data, children }: any) => {
  const navigation = useNavigation();

  const [vdata, setVData] = useState(data);
  const [filterResult, setFilterResult] = useState(null);
  const [filterIndex, setFilterIndex] = useState(0);

  useEffect(() => {
    setVData(data);
  }, [data]);

  const _handleSearch = (searchText: any, key: any) => {
    const newData = vdata.filter((item: any) => {
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

  const _handleOnVotersDropdownSelect = (index: any, text: any, oldData: any) => {
    const _data = Object.assign([], oldData || vdata);
    const getRewardValue = (vote: any) => {
      const reward = parseFloat(vote?.reward);
      if (Number.isFinite(reward)) return reward;
      const rshares = parseFloat(vote?.rshares);
      if (Number.isFinite(rshares)) return rshares;
      const value = parseFloat(vote?.value);
      if (Number.isFinite(value)) return value;
      return 0;
    };
    const getPercentValue = (vote: any) => {
      const percent = parseFloat(vote?.percent);
      if (Number.isFinite(percent)) return percent;
      const percent100 = parseFloat(vote?.percent100);
      if (Number.isFinite(percent100)) return percent100 * 100;
      return 0;
    };
    const getTimeValue = (vote: any) => {
      if (!vote?.time) return 0;
      const ts = new Date(vote.time).getTime();
      return Number.isFinite(ts) ? ts : 0;
    };

    if (filterIndex === index) {
      switch (index) {
        case 0:
          _data.sort((a: any, b: any) => getRewardValue(a) - getRewardValue(b));
          break;
        case 1:
          _data.sort((a: any, b: any) => getPercentValue(a) - getPercentValue(b));
          break;
        case 2:
          _data.sort((a: any, b: any) => getTimeValue(a) - getTimeValue(b));
          break;
        default:
          break;
      }
    } else {
      switch (index) {
        case 0:
          _data.sort((a: any, b: any) => getRewardValue(b) - getRewardValue(a));
          break;
        case 1:
          _data.sort((a: any, b: any) => getPercentValue(b) - getPercentValue(a));
          break;
        case 2:
          _data.sort((a: any, b: any) => getTimeValue(b) - getTimeValue(a));
          break;
        default:
          break;
      }
    }
    setFilterResult(_data);
    setFilterIndex(index);
  };

  const _handleOnUserPress = (username: any) => {
    (navigation as any).navigate({
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
