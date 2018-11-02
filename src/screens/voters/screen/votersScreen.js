import React, { Component } from 'react';
import { View } from 'react-native';

// Constants

// Components
import { EditorHeader } from '../../../components/editorHeader';
import { FilterBar } from '../../../components/filterBar';
import { VotersDisplay } from '../../../components/votersDisplay';

// Styles
// eslint-disable-next-line
//import styles from './_styles';

class VotersScreen extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {
      data: props.votes,
      filterResult: null,
    };
  }

  // Component Life Cycles

  // Component Functions
  _handleOnDropdownSelect = () => {};

  _handleRightIconPress = () => {};

  _handleSearch = (text) => {
    const { data } = this.state;

    const newData = data.filter((item) => {
      const itemName = item.voter.toUpperCase();
      // ${item.name.first.toUpperCase()} ${item.name.last.toUpperCase()}`;
      const _text = text.toUpperCase();

      return itemName.indexOf(_text) > -1;
    });

    this.setState({ filterResult: newData });
  };

  render() {
    const { data, filterResult } = this.state;
    const headerTitle = `Voters Info (${data && data.length})`;

    return (
      <View>
        <EditorHeader
          title={headerTitle}
          rightIconName="ios-search"
          isHasSearch
          handleOnSearch={this._handleSearch}
        />
        <FilterBar
          dropdownIconName="md-arrow-dropdown"
          options={['REWARDS', 'PERCENT', 'TIME']}
          defaultText="REWARDS"
          onDropdownSelect={this._handleOnDropdownSelect}
        />
        <VotersDisplay votes={filterResult || data} />
      </View>
    );
  }
}

export default VotersScreen;
