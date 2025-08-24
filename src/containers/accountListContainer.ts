import { useState, useEffect } from 'react';

import { useNavigation } from '@react-navigation/native';
import { isBefore } from '../utils/time';

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

    if (filterIndex === index) {
      switch (index) {
        case 0:
          _data.sort((a, b) => Number(a.value) - Number(b.value));
          break;
        case 1:
          _data.sort((a, b) => a.percent - b.percent);
          break;
        case 2:
          _data.sort((a, b) => isBefore(b.time, a.time));
          break;
        default:
          break;
      }
    } else {
      switch (index) {
        case 0:
          _data.sort((a, b) => Number(b.value) - Number(a.value));
          break;
        case 1:
          _data.sort((a, b) => b.percent - a.percent);
          break;
        case 2:
          _data.sort((a, b) => isBefore(a.time, b.time));
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
