import { PureComponent } from 'react';

import { isBefore } from '../utils/time';

class AccountListContainer extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      filterResult: null,
    };
  }

  // Component Life Cycles

  // Component Functions

  _handleSearch = (searchText, key) => {
    const { data } = this.state;

    const newData = data.filter(item => {
      const itemName = item[key].toUpperCase();
      const _text = searchText.toUpperCase();

      return itemName.indexOf(_text) > -1;
    });

    this.setState({ filterResult: newData });
  };

  _handleOnVotersDropdownSelect = index => {
    const { data } = this.state;
    const _data = data;

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

    this.setState({ filterResult: _data });
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
      })
    );
  }
}

export default AccountListContainer;
