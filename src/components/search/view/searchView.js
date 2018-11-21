import React, { Component } from 'react';
import { View, TextInput, Text } from 'react-native';

// Constants

// Components
import { Icon, FormInput } from '../..';

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
    console.log('111111111');
    return (
      <View style={styles.container}>
        <Icon color="#fff" name="ios-search" />
        <FormInput
          rightIconName="md-at"
          leftIconName="md-close-circle"
          // isValid={isUsernameValid}
          // onChange={value => this._handleUsernameChange(value)}
          placeholder="Username"
          isEditable
          type="username"
          isFirstImage
          // value={username}
        />
        <Text style={{ color: 'white' }}>sadsadahfasjfhkajsdjkhaskfasjkfjasfjlajsfkas</Text>
      </View>
    );
  }
}

export default SearchView;
