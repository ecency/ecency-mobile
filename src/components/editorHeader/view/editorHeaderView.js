import React, { Component } from 'react';
import { View } from 'react-native';
import { TextButton } from '../..';
import { IconButton } from '../../iconButton';
// Constants

// Components

// Styles
import styles from './editorHeaderStyles';

class EditorHeaderView extends Component {
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

  render() {
    const { handleOnPressBackButton } = this.props;

    return (
      <View style={styles.container}>
        <IconButton
          style={styles.backIconButton}
          iconStyle={styles.backIcon}
          name="md-arrow-back"
          onPress={() => handleOnPressBackButton()}
        />
        <IconButton
          style={styles.iconButton}
          iconStyle={styles.rightIcon}
          size={20}
          name="ios-timer"
        />
        <IconButton
          style={styles.iconButton}
          size={25}
          iconStyle={styles.rightIcon}
          name="ios-eye"
        />
        <TextButton textStyle={styles.textButton} style={styles.textButtonWrapper} text="Publish" />
      </View>
    );
  }
}

export default EditorHeaderView;
