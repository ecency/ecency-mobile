import React, { Component, Fragment } from 'react';
import { TextInput } from 'react-native';
// Constants

// Components

// Styles
import styles from './titleAreaStyles';

export default class TitleAreaView extends Component {
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
    const { onChange, value } = this.props;

    return (
      <Fragment>
        <TextInput
          style={styles.textInput}
          placeholderTextColor="c1c5c7"
          editable
          maxLength={250}
          placeholder="Title"
          multiline
          numberOfLines={4}
          onChangeText={text => onChange && onChange(text)}
          value={value}
        />
      </Fragment>
    );
  }
}
