import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Constants

// Components

// Styles
import styles from './informationAreaStyles';

class FormInputView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { string }     description       - Description texts.
   *   @prop { string }     iconName          - For icon render name.
   *
   */
  constructor(props) {
    super(props);

    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const { description, iconName, bold } = this.props;

    return (
      <View style={styles.container}>
        <Ionicons color="#c1c5c7" style={styles.infoIcon} name={iconName} />
        <Text style={[styles.infoText, bold && styles.bold]}>{description}</Text>
      </View>
    );
  }
}

export default FormInputView;
