import React, { Component } from 'react';
import {
  View, Text, Image, TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';

// Constants

// Components

// Styles
import styles from './formInputStyles';

class FormInputView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { string }     placeholder       - Place holder text.
    *   @prop { string }     type              - Input type.
    *   @prop { boolean }    isFirstImage      - Render image from steem.
    *   @prop { boolean }    isEditable        - Can permission edit.
    *   @prop { boolean }    isValid           - This delegate input valit or not.
    *   @prop { boolean }    secureTextEntry   - For hiding password value.
    *
    *
    *
    */
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      inputBorderColor: '#c1c5c7',
      isValid: true,
    };
  }

  // Component Life Cycles
  componentWillReceiveProps(nextProps) {
    const { isValid } = this.props;

    if (nextProps.isValid !== isValid) {
      this.setState({ isValid: nextProps.isValid });
    }
  }

  // Component Functions
  _handleOnChange = (value) => {
    const { onChange } = this.props;

    this.setState({ value });
    onChange && onChange(value);
  };

  render() {
    const { inputBorderColor, isValid, value } = this.state;
    const {
      placeholder,
      type,
      isFirstImage,
      isEditable,
      leftIconName,
      rightIconName,
      secureTextEntry,
    } = this.props;

    return (
      <View
        style={[
          styles.wrapper,
          {
            borderBottomColor: isValid ? inputBorderColor : 'red',
          },
        ]}
      >
        {isFirstImage && value && value.length > 2 ? (
          <View style={{ flex: 0.15 }}>
            <FastImage
              style={styles.firstImage}
              source={{
                uri: `https://steemitimages.com/u/${value}/avatar/small`,
                priority: FastImage.priority.high,
              }}
              resizeMode={FastImage.resizeMode.cover}
            />
          </View>
        ) : (
          <Ionicons name={rightIconName} style={styles.icon} />
        )}
        <TextInput
          onFocus={() => this.setState({
            inputBorderColor: '$primaryBlue',
          })
          }
          onSubmitEditing={() => this.setState({
            inputBorderColor: '#c1c5c7',
          })
          }
          autoCapitalize="none"
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
          editable={isEditable || true}
          textContentType={type}
          onChangeText={(value) => {
            this._handleOnChange(value);
          }}
          value={value}
          style={styles.textInput}
        />
        {value && value.length > 0 ? (
          <Ionicons
            onPress={() => this.setState({ value: '' })}
            name={leftIconName}
            style={styles.icon}
          />
        ) : null}
      </View>
    );
  }
}

export default FormInputView;
