import React, { Component } from 'react';
import {
  View, TextInput, KeyboardAvoidingView, ScrollView, FlatList,
} from 'react-native';
import Markdown from 'react-native-markdown-renderer';

// Components
import Formats from './formats/formats';
import { IconButton } from '../../iconButton';
import { DropdownButton } from '../../dropdownButton';
import { StickyBar } from '../../basicUIElements';

// Styles
import styles from './markdownEditorStyles';
import customMarkdownStyle from './markdownPreviewStyles';

export default class MarkdownEditorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      selection: { start: 0, end: 0 },
    };
  }

  componentDidMount() {
    this.textInput.focus();
  }

  changeText = (input) => {
    const {
      onChange, handleOnTextChange, handleIsValid, componentID,
    } = this.props;

    this.setState({ text: input });

    if (onChange) {
      onChange(input);
    }

    if (handleIsValid) {
      handleIsValid(componentID, !!(input && input.length));
    }

    handleOnTextChange && handleOnTextChange(input);
  };

  _handleOnSelectionChange = (event) => {
    this.setState({
      selection: event.nativeEvent.selection,
    });
  };

  _getState = () => {
    this.setState({
      selection: {
        start: 1,
        end: 1,
      },
    });
    return this.state;
  };

  _renderPreview = () => {
    const { text } = this.state;

    alert(text);
    return (
      <View style={styles.textWrapper}>
        <ScrollView removeClippedSubviews>
          <Markdown style={customMarkdownStyle}>{text === '' ? '...' : text}</Markdown>
        </ScrollView>
      </View>
    );
  };

  _renderMarkupButton = ({ item, getState, setState }) => (
    <View style={styles.buttonWrapper}>
      <IconButton
        size={20}
        style={styles.editorButton}
        iconType={item.iconType}
        name={item.icon}
        onPress={() => item.onPress({ getState, setState, item })}
      />
    </View>
  );

  _renderEditorButtons = ({ getState, setState }) => (
    <StickyBar>
      <View style={styles.leftButtonsWrapper}>
        <FlatList
          data={Formats}
          keyboardShouldPersistTaps="always"
          renderItem={({ item, index }) => index !== 9 && this._renderMarkupButton({ item, getState, setState })
          }
          horizontal
        />
      </View>
      <View style={styles.rightButtonsWrapper}>
        <IconButton
          size={20}
          style={styles.rightIcons}
          iconType="FontAwesome"
          name="link"
          onPress={() => Formats[9].onPress({ getState, setState })}
        />
        <IconButton style={styles.rightIcons} size={20} iconType="Feather" name="image" />
        <DropdownButton
          style={styles.dropdownStyle}
          options={['option1', 'option2', 'option3', 'option4']}
          iconName="md-more"
          iconStyle={styles.dropdownIconStyle}
          isHasChildIcon
        />
      </View>
    </StickyBar>
  );

  render() {
    const { isPreviewActive } = this.props;
    const { text, selection } = this.state;

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {!isPreviewActive ? (
          <TextInput
            multiline
            onChangeText={text => this.changeText(text)}
            onSelectionChange={this._handleOnSelectionChange}
            placeholder="What would you like to write about today?"
            placeholderTextColor="#c1c5c7"
            ref={textInput => (this.textInput = textInput)}
            selection={selection}
            selectionColor="#357ce6"
            style={styles.textWrapper}
            underlineColorAndroid="transparent"
            value={text}
            {...this.props}
          />
        ) : (
          this._renderPreview()
        )}
        {!isPreviewActive
          && this._renderEditorButtons({
            getState: this._getState,
            setState: (state, callback) => {
              this.textInput.focus();
              this.setState(state, callback);
            },
          })}
      </KeyboardAvoidingView>
    );
  }
}
