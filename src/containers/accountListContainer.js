import { Component } from 'react';

import { isBefore } from '../utils/time';

import ROUTES from '../constants/routeNames';

class AccountListContainer extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      filterResult: null,
      filterIndex: '0',
    };
  }

  // Component Life Cycles

  // Component Functions

  _handleSearch = (searchText, key) => {
    const { data, filterIndex } = this.state;

    const newData = data.filter(item => {
      const itemName = item[key].toUpperCase();
      const _text = searchText.toUpperCase();

      return itemName.indexOf(_text) > -1;
    });

    if (filterIndex !== '0') {
      this._handleOnVotersDropdownSelect(filterIndex, '', newData);
    } else {
      this.setState({ filterResult: newData });
    }
  };

  _handleOnVotersDropdownSelect = (index, text, oldData) => {
    const { data } = this.state;
    const _data = Object.assign([], oldData || data);

    switch (index) {
      case '0':
        _data.sort((a, b) => Number(b.value) - Number(a.value));
        break;
      case '1':
        _data.sort((a, b) => b.percent - a.percent);
        break;
      case '2':
        _data.sort((a, b) => (isBefore(a.time, b.time) ? 1 : -1));
        break;
      default:
        break;
    }

    this.setState({ filterResult: _data, filterIndex: index });
  };

  _handleOnUserPress = username => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username,
    });
  };

  render() {
    const { data, filterResult } = this.state;
    const { children } = this.props;

    return (
      children &&
      children({
        data,
        filterResult,
        handleOnVotersDropdownSelect: this._handleOnVotersDropdownSelect,
        handleSearch: this._handleSearch,
        handleOnUserPress: this._handleOnUserPress,
      })
    );
  }
}

export default AccountListContainer;
