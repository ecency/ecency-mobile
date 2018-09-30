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
  *   @prop { string }      defaultText         - Description....
  *   @prop { string }      iconName            - Description....
  *   @prop { array }       options             - Description....
  *   @prop { function }    onSelect            - Description....
  * 
  */

// const _dropdown_2_renderRow = (rowData, rowID, highlighted) => {
//   let icon = highlighted
//     ? require("./images/heart.png")
//     : require("./images/flower.png");
//   let evenRow = rowID % 2;
//   return (
//     <TouchableHighlight underlayColor="cornflowerblue">
//       <View
//         style={[
//           styles.dropdown_2_row,
//           { backgroundColor: evenRow ? "lemonchiffon" : "white" },
//         ]}
//       >
//         <Image style={styles.dropdown_2_image} mode="stretch" source={icon} />
//         <Text
//           style={[
//             styles.dropdown_2_row_text,
//             highlighted && { color: "mediumaquamarine" },
//           ]}
//         >
//           {`${rowData.name} (${rowData.age})`}
//         </Text>
//       </View>
//     </TouchableHighlight>
//   );
// };

// const _dropdown_2_renderButtonText = rowData => {
//   const { name, age } = rowData;
//   return `${name} - ${age}`;
// };

// const _dropdown_2_renderSeparator = (
//   sectionID,
//   rowID,
//   adjacentRowHighlighted
// ) => {
//   if (rowID == DEMO_OPTIONS_1.length - 1) return;
//   let key = `spr_${rowID}`;
//   return <View style={styles.dropdown_2_separator} key={key} />;
// };

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
        // renderSeparator={(sectionID, rowID, adjacentRowHighlighted) =>
        //   _dropdown_2_renderSeparator(sectionID, rowID, adjacentRowHighlighted)
        // }
        // renderRow={() => _dropdown_2_renderRow()}
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
