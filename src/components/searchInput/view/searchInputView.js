import React from 'react';
import { View, SafeAreaView } from 'react-native';

// Components
import { Icon } from '../../icon';
import { IconButton } from '../../iconButton';
import { TextInput } from '../../textInput';

// Styles
import styles from './searchInputStyles';

/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

const SearchInputView = () => (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.inputWrapper}>
      <Icon style={styles.icon} iconType="FontAwesome" name="search" size={15} />
      <TextInput
        style={styles.input}
        onChangeText={text => console.log('text :', text)}
        placeholder="tst"
        placeholderTextColor="#c1c5c7"
        autoCapitalize="none"
        autoFocus
      />
      <IconButton
        iconStyle={styles.closeIcon}
        iconType="Ionicons"
        style={styles.closeIconButton}
        name="ios-close-circle-outline"
        onPress={() => console.log('test :')}
      />
    </View>
  </SafeAreaView>
);

export default SearchInputView;
