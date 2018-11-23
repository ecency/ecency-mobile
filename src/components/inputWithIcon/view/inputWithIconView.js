import React, { Component } from 'react';
import { View, TextInput } from 'react-native';

// Constants

// Components
import Icon from '../../icon';

// Styles
import styles from './inputWithIconStyles';

class InputWithIconView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
  }

  // Component Life Cycles

  // Component Functions
  _handleOnChange = (value) => {
    const { onChange } = this.props;

    this.setState({ value });
    if (onChange) {
      onChange(value);
    }
  };

  render() {
    const {
      rightIconName,
      leftIconName,
      placeholder,
      secureTextEntry,
      isEditable,
      type,
      handleOnPressRightIcon,
      handleOnPressLeftIcon,
    } = this.props;

    const { value } = this.state;

    return (
      <View style={styles.wrapper}>
        <Icon
          name={leftIconName}
          style={[styles.icon, styles.left]}
          onPress={() => handleOnPressLeftIcon && handleOnPressLeftIcon()}
        />
        <TextInput
          autoCapitalize="none"
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
          editable={isEditable || true}
          textContentType={type}
          onChangeText={val => this._handleOnChange(val)}
          value={value}
          style={styles.textInput}
        />
        <Icon
          onPress={() => handleOnPressRightIcon && handleOnPressRightIcon()}
          name={rightIconName}
          style={[styles.icon, styles.right]}
        />
      </View>
    );
  }
}

export default InputWithIconView;
