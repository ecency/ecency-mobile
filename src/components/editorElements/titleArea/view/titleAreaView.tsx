import React, { Component } from 'react';
import { Platform, View } from 'react-native';
import { connect } from 'react-redux';
import { selectIsDarkTheme } from '../../../../redux/selectors';
// Constants

// Components
import { TextInput } from '../../../textInput';

// Styles
import styles from './titleAreaStyles';
import globalStyles from '../../../../globalStyles';
import isAndroidOreo from '../../../../utils/isAndroidOreo';

class TitleAreaView extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      height: 0,
    };
    this.inputRef = React.createRef();
    this.textRef = props.value || '';
  }

  // Component Life Cycles
  componentDidUpdate(prevProps) {
    const { value } = this.props;
    const { value: prevValue } = prevProps;

    if (prevValue !== value && value !== this.textRef) {
      const nextText = value || '';
      this.textRef = nextText;
      this.inputRef.current?.setNativeProps({ text: nextText });
    }
  }

  // Component Functions
  _handleContentSizeChange = (event) => {
    const nextHeight = event.nativeEvent.contentSize.height;
    const { height } = this.state;

    if (nextHeight !== height) {
      this.setState({ height: nextHeight });
    }
  };

  _handleOnChange = (text) => {
    const { onChange, handleIsValid, componentID } = this.props;

    this.textRef = text;

    if (onChange) {
      onChange(text);
    }

    if (handleIsValid) {
      handleIsValid(componentID, !!(text && text.length));
    }
  };

  render() {
    const { intl, isPreviewActive, autoFocus } = this.props;
    const { height } = this.state;
    const maxHeight = isAndroidOreo() ? 24 : 35;
    const { isDarkTheme } = this.props;
    return (
      <View style={[globalStyles.containerHorizontal16, { height: Math.max(maxHeight, height) }]}>
        <TextInput
          innerRef={this.inputRef}
          style={[styles.textInput, { height: Math.max(maxHeight, height) }]}
          placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
          editable={!isPreviewActive}
          maxLength={250}
          placeholder={intl.formatMessage({
            id: 'editor.title',
          })}
          autoCorrect={Platform.OS === 'ios'}
          autoComplete={Platform.OS === 'ios' ? undefined : 'off'}
          spellCheck={Platform.OS === 'ios'}
          multiline
          numberOfLines={2}
          onContentSizeChange={this._handleContentSizeChange}
          autoFocus={autoFocus}
          onChangeText={(textT) => this._handleOnChange(textT)}
          defaultValue={this.textRef}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  isDarkTheme: selectIsDarkTheme(state),
});

export default connect(mapStateToProps)(TitleAreaView);
