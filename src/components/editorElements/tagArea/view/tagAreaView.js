import React, { Component, Fragment } from 'react';
import { View } from 'react-native';
// Constants

// Components
import { Chip } from '../../../basicUIElements';
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
      currentText: '',
      chips: [{}],
    };
  }

  // Component Life Cycles

  // Component Functions
  _handleOnChange = (text, i) => {
    this.setState({ currentText: text });
    console.log(text);

    if (text.indexOf(' ') > 0) {
      this._handleTagAdded();
    }

    if (!text) {
      alert(i);
    }
  };

  _handleOnBlur = () => {
    this._handleTagAdded();
  };

  _handleTagAdded = () => {
    const { currentText, chips } = this.state;

    // if (currentText && chips.length === 1) {
    //   this.setState({ chips: [currentText] });
    // } else
    if (currentText) {
      this.setState({
        chips: [...chips, currentText.trim()],
      });
    }
  };

  render() {
    const { onChange, value, chipsData } = this.props;
    const { currentText, chips } = this.state;

    return (
      <Fragment>
        <View style={styles.tagWrapper}>
          {chips.map((chip, i) => (
            <Chip
              key={i}
              isPin={i === 0 && chips[1]}
              placeholderTextColor="#fff"
              editable={!chipsData}
              maxLength={50}
              placeholder="tags"
              multiline={false}
              handleOnChange={text => this._handleOnChange(text, i)}
              handleOnBlur={() => this._handleOnBlur()}
              value={chips[i - 1]}
              blurOnSubmit
              autoCapitalize="none"
              returnKeyType="next"
            />
          ))}
        </View>
      </Fragment>
    );
  }
}
