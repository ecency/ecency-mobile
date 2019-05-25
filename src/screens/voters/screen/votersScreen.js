import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { injectIntl } from 'react-intl';

// Constants

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { FilterBar } from '../../../components/filterBar';
import { VotersDisplay } from '../../../components/votersDisplay';

// Utils
import { isBefore } from '../../../utils/time';
import globalStyles from '../../../globalStyles';

class VotersScreen extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      data: props.votes,
      filterResult: null,
      isRenderRequire: false,
    };
  }

  // Component Life Cycles

  // Component Functions
  _handleOnDropdownSelect = index => {
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

    this.setState({ filterResult: _data, isRenderRequire: true }, () =>
      this.setState({ isRenderRequire: false }),
    );
  };

  _handleRightIconPress = () => {};

  _handleSearch = text => {
    const { data } = this.state;

    const newData = data.filter(item => {
      const itemName = item.voter.toUpperCase();
      const _text = text.toUpperCase();

      return itemName.indexOf(_text) > -1;
    });

    this.setState({ filterResult: newData });
  };

  render() {
    const { data, filterResult, isRenderRequire } = this.state;
    const { intl } = this.props;
    const headerTitle = intl.formatMessage({
      id: 'voters.voters_info',
    });

    return (
      <View style={globalStyles.container}>
        <BasicHeader
          title={`${headerTitle} (${data && data.length})`}
          isHasSearch
          handleOnSearch={this._handleSearch}
        />
        <FilterBar
          dropdownIconName="arrow-drop-down"
          options={['REWARDS', 'PERCENT', 'TIME']}
          defaultText="REWARDS"
          onDropdownSelect={this._handleOnDropdownSelect}
        />
        {!isRenderRequire && <VotersDisplay key={Math.random()} votes={filterResult || data} />}
      </View>
    );
  }
}

export default injectIntl(VotersScreen);
