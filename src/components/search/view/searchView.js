import React, { Component } from 'react';
import { View } from 'react-native';

// Constants

// Components
import { InputWithIcon } from '../..';

// Styles
// eslint-disable-next-line
import styles from './searchStyles';

class SearchView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const { handleCloseButton, handleOnChangeSearchInput } = this.props;
    return (
      <View style={styles.container}>
        <InputWithIcon
          rightIconName="md-close-circle"
          leftIconName="md-search"
          handleOnPressRightIcon={handleCloseButton}
          onChange={value => handleOnChangeSearchInput(value)}
          placeholder="Search..."
          isEditable
          type="username"
          isFirstImage
        />
      </View>
    );
  }
}

export default SearchView;
