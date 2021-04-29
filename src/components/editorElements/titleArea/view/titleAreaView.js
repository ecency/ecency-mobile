import React, { Component } from 'react';
import { View } from 'react-native';
// Constants

// Components
import { TextInput } from '../../../textInput';
import { ThemeContainer } from '../../../../containers';

// Styles
import styles from './titleAreaStyles';
import globalStyles from '../../../../globalStyles';
import isAndroidOreo from '../../../../utils/isAndroidOreo';

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
  UNSAFE_componentWillReceiveProps = (nextProps) => {
    const { text } = this.state;
    if (nextProps.value !== text) {
      this.setState({ text: nextProps.value });
    }
  };

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
    const { intl, isPreviewActive, autoFocus } = this.props;
    const { text, height } = this.state;

    const maxHeight = isAndroidOreo() ? 24 : 35;

    return (
      <View style={[globalStyles.containerHorizontal16, { height: Math.max(maxHeight, height) }]}>
        <ThemeContainer>
          {({ isDarkTheme }) => (
            <TextInput
              style={[styles.textInput, { height: Math.max(maxHeight, height) }]}
              placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
              editable={!isPreviewActive}
              maxLength={250}
              placeholder={intl.formatMessage({
                id: 'editor.title',
              })}
              multiline
              numberOfLines={2}
              onContentSizeChange={(event) => {
                this.setState({ height: event.nativeEvent.contentSize.height });
              }}
              autoFocus={autoFocus}
              onChangeText={(textT) => this._handleOnChange(textT)}
              value={text}
            />
          )}
        </ThemeContainer>
      </View>
    );
  }
}
