import React, { Component, Fragment } from 'react';
import {
  View, SafeAreaView, Text, TextInput, ActivityIndicator,
} from 'react-native';
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
    this.state = {
      isInputVisible: false,
    };
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

  _handleSearchButtonPress = () => {
    const { isInputVisible } = this.state;

    this.setState({ isInputVisible: !isInputVisible });
  };

  _handleOnSearch = (value) => {
    const { handleOnSearch } = this.props;

    handleOnSearch(value);
  };

  _handleOnInputChange = () => {};

  render() {
    const {
      handleOnPressBackButton,
      handleOnPressPreviewButton,
      isPreviewActive,
      quickTitle,
      isFormValid,
      title,
      isHasIcons,
      rightIconName,
      isHasDropdown,
      handleRightIconPress,
      isModalHeader,
      handleOnPressClose,
      isHasSearch,
      isPostSending,
      handleOnSaveButtonPress,
      isDraftSaving,
      isDraftSaved,
      isLoggedIn,
    } = this.props;
    const { isInputVisible } = this.state;
    return (
      <SafeAreaView>
        <View style={styles.container}>
          <View style={styles.backWrapper}>
            <IconButton
              iconStyle={[styles.backIcon, isModalHeader && styles.closeIcon]}
              iconType={isModalHeader && 'FontAwesome'}
              name={isModalHeader ? 'close' : 'md-arrow-back'}
              onPress={() => (isModalHeader ? handleOnPressClose() : handleOnPressBackButton())}
            />
            {isHasIcons && (
              <View>
                {!isDraftSaving ? (
                  <IconButton
                    iconStyle={[styles.saveIcon, isDraftSaved && styles.savedIcon]}
                    iconType="FontAwesome"
                    name="save"
                    onPress={() => handleOnSaveButtonPress && handleOnSaveButtonPress()}
                  />
                ) : (
                  <ActivityIndicator style={styles.textButtonWrapper} />
                )}
              </View>
            )}

            {!isInputVisible && (
              <Text style={[title && styles.title, quickTitle && styles.quickTitle]}>
                {quickTitle || title}
              </Text>
            )}

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

            {rightIconName
              && !isHasSearch && (
                <IconButton
                  style={styles.rightIcon}
                  size={25}
                  onPress={() => handleRightIconPress()}
                  iconStyle={styles.rightIcon}
                  name={rightIconName}
                />
            )}

            {isInputVisible && (
              <TextInput
                onChangeText={value => this._handleOnSearch(value)}
                autoFocus
                placeholder="Search"
                autoCapitalize="none"
                style={styles.textInput}
              />
            )}

            {isHasSearch && (
              <IconButton
                style={styles.rightIcon}
                size={25}
                onPress={() => this._handleSearchButtonPress()}
                iconStyle={styles.rightIcon}
                name={rightIconName}
              />
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
              {!isPostSending ? (
                <TextButton
                  textStyle={[
                    styles.textButton,
                    isFormValid && isLoggedIn ? styles.textButtonEnable : styles.textButtonDisable,
                  ]}
                  onPress={isFormValid && this._handleOnPress}
                  style={styles.textButtonWrapper}
                  text="Publish"
                />
              ) : (
                <ActivityIndicator style={styles.textButtonWrapper} />
              )}
            </Fragment>
          )}
        </View>
      </SafeAreaView>
    );
  }
}

export default EditorHeaderView;
