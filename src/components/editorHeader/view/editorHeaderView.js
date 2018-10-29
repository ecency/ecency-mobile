import React, { Component, Fragment } from 'react';
import { View, SafeAreaView, Text } from 'react-native';
import { TextButton } from '../..';
import { IconButton } from '../../iconButton';
// Constants

// Components
import { DropdownButton } from '../../dropdownButton';

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

  _handleOnPress = () => {
    const { handleOnSubmit } = this.props;

    if (handleOnSubmit) {
      handleOnSubmit();
    }
  };

  _handleOnDropdownSelect = () => {};

  render() {
    const {
      handleOnPressBackButton,
      handleOnPressPreviewButton,
      isPreviewActive,
      quickTitle,
      isFormValid,
      title,
      isHasIcons,
      isHasDropdown,
    } = this.props;

    return (
      <SafeAreaView>
        <View style={styles.container}>
          <View style={styles.backWrapper}>
            <IconButton
              iconStyle={styles.backIcon}
              name="md-arrow-back"
              onPress={() => handleOnPressBackButton()}
            />

            <Text style={[title && styles.title, quickTitle && styles.quickTitle]}>
              {quickTitle || title}
            </Text>

            {isHasDropdown && (
              <View>
                <DropdownButton
                  isHasChildIcon
                  iconName="md-more"
                  options={['ALL ACTIVITIES', 'VOTES', 'REPLIES', 'MENTIONS', 'FOLLOWS', 'REBLOGS']}
                  onSelect={this._handleOnDropdownSelect}
                />
              </View>
            )}
          </View>

          {isHasIcons && (
            <Fragment>
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
                onPress={isFormValid && this._handleOnPress}
                style={styles.textButtonWrapper}
                text="Publish"
              />
            </Fragment>
          )}
        </View>
      </SafeAreaView>
    );
  }
}

export default EditorHeaderView;
