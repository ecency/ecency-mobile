import React, { Component } from 'react';
import { TextInput, View } from 'react-native';
// Constants

// Components

// Styles
import styles from './titleAreaStyles';
import globalStyles from '../../../../globalStyles';

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
    const { onChange, value, isPreviewActive } = this.props;

    return (
      <View style={globalStyles.containerHorizontal16}>
        <TextInput
          style={styles.textInput}
          placeholderTextColor="c1c5c7"
          editable={!isPreviewActive}
          maxLength={250}
          placeholder="Title"
          multiline
          autoFocus
          numberOfLines={4}
          onChangeText={text => onChange && onChange(text)}
          value={value}
          {...this.props}
        />
      </View>
    );
  }
}
