import React, { Component } from 'react';
import { View } from 'react-native';
// Constants

// Components
import { Chip } from '../../../basicUIElements';
// Styles
import styles from './tagAreaStyles';
import globalStyles from '../../../../globalStyles';

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
    this.setState({ currentText: text.trim() });

    // if (text.indexOf(' ') > 0 && text) {
    //   this._handleTagAdded();
    // }

    if (!text && i !== 0) {
      this._handleTagRemove(i);
    }
  };

  _handleOnBlur = () => {
    this._handleTagAdded();
  };

  _handleTagAdded = () => {
    const { currentText, chips } = this.state;

    if (currentText && chips.length < 5) {
      this.setState({
        chips: [...chips, currentText.trim()],
      });
    }
  };

  _handleTagRemove = (i) => {
    const { chips } = this.state;

    this.setState({
      chips: chips.filter((_, _i) => _i !== i),
    });
  };

  render() {
    const { chipsData } = this.props;
    const { chips } = this.state;

    return (
      <View style={globalStyles.containerHorizontal16}>
        <View style={styles.tagWrapper}>
          {chips.map((chip, i) => (
            <Chip
              key={i}
              refs={(input) => {
                this.inputs[i] = input;
              }}
              isPin={i === 0 && chips[1]}
              placeholderTextColor="#fff"
              editable={!chipsData}
              maxLength={50}
              placeholder="tags"
              autoFocus={i !== 0 && chips.length - 1 === i}
              multiline={false}
              handleOnChange={text => this._handleOnChange(text, i)}
              handleOnBlur={() => this._handleOnBlur()}
              blurOnSubmit
              autoCapitalize="none"
              {...this.props}
            />
          ))}
        </View>
      </View>
    );
  }
}
