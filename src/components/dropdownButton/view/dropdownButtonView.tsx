import React from 'react';
import { View, Text, ActivityIndicator, TouchableHighlight } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
// External components
import ModalDropdown from 'react-native-modal-dropdown';
import { Icon } from '../../icon';

// Styles
import styles from './dropdownButtonStyles';

/* Props TODO: Fill all description
 * ------------------------------------------------
 *   @prop { string }      defaultText         - Description....
 *   @prop { string }      iconName            - Description....
 *   @prop { array }       options             - Description....
 *   @prop { function }    onSelect            - Description....
 *
 */

const renderDropdownRow = (
  rowData,
  rowID,
  highlighted,
  rowTextStyle,
  noHighlight,
  dropdownRowWrapper,
) => (
  <View
    style={[
      styles.dropdownRow,
      dropdownRowWrapper,
      !noHighlight && highlighted && styles.highlightedRow,
    ]}
  >
    <Text
      style={[
        rowTextStyle || styles.rowText,
        !noHighlight && highlighted && styles.highlightedRowText,
      ]}
    >
      {rowData}
    </Text>
  </View>
);
const adjustDropdownFrame = (style: any) => {
  style.left = 'auto';
  style.right = 10;
  return style;
};
const DropdownButtonView = ({
  childIconWrapperStyle,
  children,
  defaultText,
  iconStyle,
  iconName,
  isHasChildIcon,
  onSelect,
  dropdownStyle,
  dropdownTextStyle,
  dropdownButtonStyle,
  textStyle,
  rowTextStyle,
  selectedOptionIndex,
  options,
  style,
  noHighlight,
  isLoading,
  dropdownRef,
  dropdownRowWrapper,
}) => (
  <View style={[styles.container, dropdownButtonStyle]}>
    <ModalDropdown
      ref={dropdownRef}
      renderRowComponent={TouchableHighlight}
      renderRowProps={{
        underlayColor: EStyleSheet.value('$modalBackground'),
        style: styles.rowWrapper,
      }}
      style={[!style ? styles.button : style]}
      textStyle={[textStyle || styles.buttonText]}
      dropdownStyle={[styles.dropdown, dropdownStyle, { height: 32 * (options.length + 0.8) }]}
      dropdownTextStyle={[dropdownTextStyle || styles.dropdownText]}
      dropdownTextHighlightStyle={styles.dropdownTextHighlight}
      options={options}
      onSelect={(e) => onSelect && onSelect(e, options[e])}
      defaultIndex={selectedOptionIndex}
      defaultValue={defaultText}
      renderSeparator={() => null}
      showsVerticalScrollIndicator={false}
      renderRow={(rowData, rowID, highlighted) =>
        renderDropdownRow(
          rowData,
          rowID,
          highlighted,
          rowTextStyle,
          noHighlight,
          dropdownRowWrapper,
        )
      }
      adjustFrame={(style: any) => adjustDropdownFrame(style)}
    >
      {isHasChildIcon && !isLoading ? (
        <View style={styles.childrenWrapper}>
          <Text style={[textStyle || styles.buttonText]}>{defaultText}</Text>
          <View style={[styles.iconWrapper, childIconWrapperStyle && childIconWrapperStyle]}>
            <Icon
              style={[styles.dropdownIcon, iconStyle]}
              iconType="MaterialIcons"
              name={!iconName ? 'arrow-drop-down' : iconName}
            />
          </View>
        </View>
      ) : (
        isHasChildIcon && <ActivityIndicator color={EStyleSheet.value('$primaryBlue')} />
      )}
    </ModalDropdown>
    {!children && !isHasChildIcon && (
      <View style={styles.iconWrapper}>
        <Icon
          style={styles.dropdownIcon}
          iconType="MaterialIcons"
          name={!iconName ? 'arrow-drop-down' : iconName}
        />
      </View>
    )}
  </View>
);

export default DropdownButtonView;
