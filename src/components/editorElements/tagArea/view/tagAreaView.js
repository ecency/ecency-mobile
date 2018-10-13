import React, { Component, Fragment } from 'react';
import { TextInput, View } from 'react-native';
// Constants

// Components

// Styles
import styles from './tagAreaStyles';

export default class TagAreaView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      isFirstTag: false,
    };
  }

  // Component Life Cycles

  // Component Functions
  _handleOnChange = (text) => {
    this.setState({ text });
    console.log(text);

    if (text.indexOf(' ') > 0) {
      this.setState({ isFirstTag: true });
    } else if (!text) {
      this.setState({ isFirstTag: false });
    }
  };

  render() {
    const { onChange, value } = this.props;
    const { isFirstTag, text } = this.state;

    return (
      <Fragment>
        <View style={styles.tagWrapper}>
          <TextInput
            style={[styles.textInput, isFirstTag && styles.firstTag]}
            placeholderTextColor="#fff"
            editable
            maxLength={250}
            placeholder="tags"
            multiline={false}
            onChangeText={text => this._handleOnChange(text)}
            value={value}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.textInput}
            placeholderTextColor="#fff"
            editable
            maxLength={250}
            placeholder="tags"
            multiline={false}
            onChangeText={text => this._handleOnChange(text)}
            value={value}
            autoCapitalize="none"
          />
        </View>
      </Fragment>
    );
  }
}
