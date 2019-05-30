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
    this.state = {
      text: props.value || null,
      height: 0,
    };
  }

  // Component Life Cycles
  componentWillReceiveProps = nextProps => {
    const { text } = this.state;
    if (nextProps.value !== text) {
      this.setState({ text: nextProps.value });
    }
  };

  // Component Functions
  _handleOnChange = text => {
    const { onChange, handleIsValid, componentID } = this.props;
    if (onChange) {
      onChange(text);
    }

    if (handleIsValid) {
      handleIsValid(componentID, !!(text && text.length));
    }
  };

  render() {
    const { intl, isPreviewActive, autoFocus } = this.props;
    const { text, height } = this.state;

    return (
      <View style={globalStyles.containerHorizontal16}>
        <TextInput
          style={[styles.textInput, { height: Math.max(35, height) }]}
          placeholderTextColor="#c1c5c7"
          editable={!isPreviewActive}
          maxLength={250}
          placeholder={intl.formatMessage({
            id: 'editor.title',
          })}
          multiline
          numberOfLines={4}
          onContentSizeChange={event => {
            this.setState({ height: event.nativeEvent.contentSize.height });
          }}
          autoFocus={autoFocus}
          onChangeText={text => this._handleOnChange(text)}
          value={text}
        />
      </View>
    );
  }
}
