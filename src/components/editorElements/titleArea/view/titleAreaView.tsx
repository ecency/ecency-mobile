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
      text: props.value || null,
      height: 0,
    };
    this.inputRef = React.createRef();
    this.textRef = props.value || '';
  }

  // Component Life Cycles
  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value && this.props.value !== this.state.text) {
      this.setState({ text: this.props.value });
      this.textRef = this.props.value;
    }
  }

  // Component Functions
  _handleOnChange = (text) => {
    const { onChange, handleIsValid, componentID } = this.props;

    this.textRef = text;
    this.setState({ text });

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
          onContentSizeChange={(event) => {
            this.setState({ height: event.nativeEvent.contentSize.height });
          }}
          autoFocus={autoFocus}
          onChangeText={(textT) => this._handleOnChange(textT)}
          value={text}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  isDarkTheme: selectIsDarkTheme(state),
});

export default connect(mapStateToProps)(TitleAreaView);
