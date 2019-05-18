import React from 'react';
import { SafeAreaView } from 'react-native';

// Components
import { Icon } from '../../icon';
import { IconButton } from '../../iconButton';
import { TextInput } from '../../textInput';

// Styles
import styles from './searchInputStyles';

/* Props
 * ------------------------------------------------
 *   @prop { func }    onChangeText            - The function will trigger when input on change
 *   @prop { func }    handleOnModalClose      - Handle on click method for close button
 *   @prop { string }  placeholder             - Placeholder for input
 *   @prop { bool }    editable                - Editable value for input. Default value is true.
 */
const SearchInputView = ({
  onChangeText,
  handleOnModalClose,
  placeholder,
  editable = true,
  autoFocus = true,
}) => (
  <SafeAreaView style={styles.inputWrapper}>
    <Icon style={styles.icon} iconType="FontAwesome" name="search" size={15} />
    <TextInput
      style={styles.input}
      onChangeText={text => onChangeText(text)}
      placeholder={placeholder}
      placeholderTextColor="#c1c5c7"
      autoCapitalize="none"
      autoFocus={autoFocus}
      editable={editable}
    />
    <IconButton
      iconStyle={styles.closeIcon}
      iconType="Ionicons"
      style={styles.closeIconButton}
      name="ios-close-circle-outline"
      onPress={() => handleOnModalClose()}
    />
  </SafeAreaView>
);

export default SearchInputView;
