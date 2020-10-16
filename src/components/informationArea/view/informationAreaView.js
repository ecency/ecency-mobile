import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
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
    const { description, iconName, bold, link } = this.props;

    return (
      <TouchableOpacity onPress={() => Linking.openURL(link)}>
        <View style={styles.container}>
          <Ionicons color="#c1c5c7" style={styles.infoIcon} name={iconName} />
          <Text style={[styles.infoText, bold && styles.bold]}>{description}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

export default FormInputView;
