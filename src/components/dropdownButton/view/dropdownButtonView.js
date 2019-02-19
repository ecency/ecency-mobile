import React from 'react';
import {
  View, Text, TouchableHighlight, ActivityIndicator,
} from 'react-native';

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

const renderDropdownRow = (rowData, rowID, highlighted, rowTextStyle, noHighlight) => (
  <TouchableHighlight style={styles.rowWrapper} underlayColor="#E9F2FC">
    <View style={[styles.dropdownRow, !noHighlight && highlighted && styles.highlightedRow]}>
      <Text
        style={[
          rowTextStyle || styles.rowText,
          !noHighlight && highlighted && styles.highlightedRowText,
        ]}
      >
        {rowData}
      </Text>
    </View>
  </TouchableHighlight>
);

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
}) => (
  <View style={[styles.container, dropdownButtonStyle]}>
    <ModalDropdown
      style={[!style ? styles.button : style]}
      textStyle={[textStyle || styles.buttonText]}
      dropdownStyle={[styles.dropdown, dropdownStyle, { height: 35 * (options.length + 1) }]}
      dropdownTextStyle={[dropdownTextStyle || styles.dropdownText]}
      dropdownTextHighlightStyle={styles.dropdownTextHighlight}
      options={options}
      onSelect={e => onSelect && onSelect(e, options[e])}
      defaultIndex={selectedOptionIndex}
      defaultValue={defaultText}
      renderSeparator={() => null}
      renderRow={(rowData, rowID, highlighted) => renderDropdownRow(rowData, rowID, highlighted, rowTextStyle, noHighlight)
      }
    >
      {isHasChildIcon && !isLoading ? (
        <View style={[styles.iconWrapper, childIconWrapperStyle && childIconWrapperStyle]}>
          <Icon
            style={[styles.dropdownIcon, iconStyle]}
            iconType="MaterialIcons"
            name={!iconName ? 'arrow-drop-down' : iconName}
          />
        </View>
      ) : (
        isHasChildIcon && <ActivityIndicator />
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
