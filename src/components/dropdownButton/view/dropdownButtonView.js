import React from 'react';
import { View, Text, TouchableHighlight } from 'react-native';
import { Dimensions } from 'react-native';

// External components
import ModalDropdown from 'react-native-modal-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Styles
import styles from './dropdownButtonStyles';

// Constants
const DEVICE_HEIGHT = Dimensions.get('window').height;

/* Props TODO: Fill all description
  * ------------------------------------------------
  *   @prop { string }      defaultText         - Description....
  *   @prop { string }      iconName            - Description....
  *   @prop { array }       options             - Description....
  *   @prop { function }    onSelect            - Description....
  *
  */

const renderDropdownRow = (rowData, rowID, highlighted) => (
  <TouchableHighlight style={styles.rowWrapper} underlayColor="#E9F2FC">
    <View style={[styles.dropdownRow, highlighted && styles.highlightedRow]}>
      <Text
        style={[styles.rowText, highlighted && styles.highlightedRowText]}
      >
        {rowData}
      </Text>
    </View>
  </TouchableHighlight>
);

const DropdownButtonView = ({
  defaultText,
  iconName,
  options,
  onSelect,
  defaultIndex,
}) => (
  <View style={styles.container}>
    <ModalDropdown
      style={styles.button}
      textStyle={styles.buttonText}
      dropdownStyle={[styles.dropdown, { height: 35 * (options.length + 1) }]}
      dropdownTextStyle={styles.dropdownText}
      dropdownTextHighlightStyle={styles.dropdownTextHighlight}
      options={options}
      onSelect={e => onSelect && onSelect(e)}
      defaultIndex={defaultIndex}
      defaultValue={defaultText}
      renderSeparator={() => null}
      renderRow={(rowData, rowID, highlighted) => renderDropdownRow(rowData, rowID, highlighted)
      }
    />
    <View style={styles.iconWrapper}>
      <Ionicons
        style={styles.dropdownIcon}
        name={!iconName ? 'md-arrow-dropdown' : iconName}
      />
    </View>
  </View>
);

export default DropdownButtonView;
