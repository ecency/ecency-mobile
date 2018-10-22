import React, { Component } from 'react';
import { View, SafeAreaView, Text } from 'react-native';
import { TextButton } from '../..';
import { IconButton } from '../../iconButton';
// Constants

// Components

// Styles
import styles from './editorHeaderStyles';

class EditorHeaderView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { boolean }    isFormValid                - Righst button propertie
    *   @prop { string }     quickTitle                 - Left side behind back button text
    */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const {
      handleOnPressBackButton,
      handleOnPressPreviewButton,
      isPreviewActive,
      quickTitle,
      isFormValid,
    } = this.props;

    return (
      <SafeAreaView>
        <View style={styles.container}>
          <IconButton
            iconStyle={styles.backIcon}
            name="md-arrow-back"
            onPress={() => handleOnPressBackButton()}
          />
          <Text style={styles.quickTitle}>{quickTitle}</Text>
          <IconButton
            style={styles.iconButton}
            iconStyle={styles.rightIcon}
            size={20}
            name="ios-timer"
          />
          <IconButton
            style={styles.iconButton}
            size={25}
            onPress={() => handleOnPressPreviewButton()}
            iconStyle={styles.rightIcon}
            name={isPreviewActive ? 'ios-eye' : 'ios-eye-off'}
          />
          <TextButton
            textStyle={[
              styles.textButton,
              isFormValid ? styles.textButtonEnable : styles.textButtonDisable,
            ]}
            style={styles.textButtonWrapper}
            text="Publish"
          />
        </View>
      </SafeAreaView>
    );
  }
}

export default EditorHeaderView;
