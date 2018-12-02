import React, { Component } from 'react';
import { View } from 'react-native';
// Constants

// Components
import { TextInput } from '../../../textInput';

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
  _handleOnChange = (text) => {
    const { onChange, handleIsValid, componentID } = this.props;
    if (onChange) {
      onChange(text);
    }

    if (handleIsValid) {
      handleIsValid(componentID, !!(text && text.length));
    }
  };

  render() {
    const {
      intl, isPreviewActive, value, autoFocus,
    } = this.props;

    return (
      <View style={globalStyles.containerHorizontal16}>
        <TextInput
          style={styles.textInput}
          placeholderTextColor="#c1c5c7"
          editable={!isPreviewActive}
          maxLength={250}
          placeholder={intl.formatMessage({
            id: 'editor.title',
          })}
          multiline
          autoFocus={autoFocus}
          numberOfLines={4}
          onChangeText={text => this._handleOnChange(text)}
          // TODO: Fix it
          // value={value && value}
          // {...this.props}
        />
      </View>
    );
  }
}
