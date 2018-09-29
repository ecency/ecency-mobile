import React from "react";
import { View, Text } from "react-native";
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
  *   @prop { string }      text                - Description....
  *   @prop { string }      iconName            - Description....
  *   @prop { array }       options             - Description....
  *   @prop { function }    onSelect            - Description....
  * 
  */

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
          { height: DEVICE_HEIGHT / (19 / options.length + 1) },
        ]}
        dropdownTextStyle={styles.dropdownText}
        dropdownTextHighlightStyle={styles.dropdownTextHighlight}
        options={options}
        onSelect={e => onSelect && onSelect(e)}
        defaultIndex={defaultIndex}
        defaultValue={defaultText}
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
