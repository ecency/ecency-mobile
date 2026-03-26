import React from 'react';
import { View, Text, ActivityIndicator, TouchableHighlight, Dimensions } from 'react-native';
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
    key={rowID}
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
  disableFrameAdjustment,
}) => {
  const adjustDropdownFrame = (frame: any) => {
    if (disableFrameAdjustment) {
      return frame;
    }

    const screenWidth = Dimensions.get('window').width;
    const margin = 10;

    // Ensure dropdown doesn't overflow right edge
    if (frame.left + frame.width > screenWidth - margin) {
      frame.left = screenWidth - frame.width - margin;
    }

    // Ensure dropdown doesn't overflow left edge
    if (frame.left < margin) {
      frame.left = margin;
    }

    return frame;
  };

  return (
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
        dropdownStyle={[
          styles.dropdown,
          { height: Math.min(32 * (options.length + 0.8), Dimensions.get('window').height * 0.45) },
          dropdownStyle,
        ]}
        dropdownTextStyle={[dropdownTextStyle || styles.dropdownText]}
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
        adjustFrame={(frame: any) => adjustDropdownFrame(frame)}
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
};

export default DropdownButtonView;
