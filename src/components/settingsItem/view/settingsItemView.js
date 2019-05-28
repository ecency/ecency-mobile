import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';

// Constants

// Components
import { DropdownButton } from '../../dropdownButton';
import { TextButton } from '../../buttons';
import { ToggleSwitch } from '../../toggleSwitch';
// Styles
import styles from './settingsItemStyles';

class SettingsItemView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions
  _renderItem = () => {
    const {
      type,
      options,
      selectedOptionIndex,
      handleOnChange,
      text,
      isOn,
      actionType,
      defaultText,
      handleOnButtonPress,
    } = this.props;

    switch (type) {
      case 'dropdown':
        return (
          <DropdownButton
            key={options[selectedOptionIndex]}
            defaultText={defaultText || options[selectedOptionIndex]}
            dropdownButtonStyle={styles.dropdownButtonStyle}
            selectedOptionIndex={selectedOptionIndex}
            rowTextStyle={styles.rowTextStyle}
            style={styles.dropdown}
            dropdownStyle={styles.dropdownStyle}
            textStyle={styles.dropdownText}
            options={options}
            onSelect={e => handleOnChange(e, type, actionType)}
          />
        );

      case 'toggle':
        return (
          <ToggleSwitch
            size="large"
            isOn={isOn}
            onToggle={e => handleOnChange(e, type, actionType)}
          />
        );
      case 'button':
        return (
          <TextButton
            onPress={() => handleOnButtonPress(actionType)}
            textStyle={styles.textStyle}
            style={styles.textButton}
            text={text}
          />
        );

      default:
        return (
          <TextButton
            onPress={() => handleOnChange(null, type)}
            textStyle={styles.textStyle}
            style={styles.textButton}
            text={text}
          />
        );
    }
  };

  render() {
    const { title, titleStyle } = this.props;

    return (
      <View style={styles.wrapper}>
        <Text style={[styles.text, titleStyle]}>{title}</Text>
        {this._renderItem()}
      </View>
    );
  }
}

export default SettingsItemView;
