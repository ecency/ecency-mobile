import React from "react";
import { View, Text, TouchableHighlight } from "react-native";
import { Dimensions } from "react-native";

// Constants
const DEVICE_HEIGHT = Dimensions.get("window").height;

// External components
import ModalDropdown from "react-native-modal-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";

// Styles
import styles from "./dropdownButtonStyles";

/* Props
  * ------------------------------------------------
  *   @prop { string }      defaultText         - Description....
  *   @prop { string }      iconName            - Description....
  *   @prop { array }       options             - Description....
  *   @prop { function }    onSelect            - Description....
  * 
  */

const renderDropdownRow = (rowData, rowID, highlighted) => {
  return (
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
};

// const _dropdown_2_renderButtonText = rowData => {
//   const { name, age } = rowData;
//   return `${name} - ${age}`;
// };

const renderDropdownSeperator = () => null;

const DropdownButtonView = ({
  defaultText,
  iconName,
  options,
  onSelect,
  defaultIndex,
}) => (
  <View style={styles.container}>
    <View style={styles.dropdownWrapper}>
      <ModalDropdown
        style={styles.button}
        textStyle={styles.buttonText}
        dropdownStyle={[
          styles.dropdown,
          // { height: DEVICE_HEIGHT / (19 / options.length + 1) },
        ]}
        dropdownTextStyle={styles.dropdownText}
        dropdownTextHighlightStyle={styles.dropdownTextHighlight}
        options={options}
        onSelect={e => onSelect && onSelect(e)}
        defaultIndex={defaultIndex}
        defaultValue={defaultText}
        // renderButtonText={rowData => _dropdown_2_renderButtonText(rowData)}
        renderSeparator={() => renderDropdownSeperator()}
        renderRow={(rowData, rowID, highlighted) =>
          renderDropdownRow(rowData, rowID, highlighted)
        }
      />
    </View>
    <View style={styles.iconWrapper}>
      <Ionicons
        style={styles.dropdownIcon}
        name={!iconName ? "md-arrow-dropdown" : iconName}
      />
    </View>
  </View>
);

export default DropdownButtonView;
