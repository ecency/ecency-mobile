import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../../icon';
import { ButtonGroup } from 'react-native-elements';

// External Components
import { DropdownButton } from '../../dropdownButton';

// Components
import { LineBreak, Tag } from '../../basicUIElements';

// Styles
import styles from './filterBarStyles';
import { relative } from 'path';

/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

const FilterBarView = ({
  defaultText,
  dropdownIconName,
  iconSize,
  isHide,
  onDropdownSelect,
  onRightIconPress,
  options,
  rightIconName,
  rightIconType,
  selectedOptionIndex,
}) => (
    <View style={styles.container}>
      {!isHide && (
        <LineBreak height={38}>
          <View style={styles.filterBarWrapper}>
            <View style={styles.dropdownWrapper}>
              <ButtonGroup
                selectedIndex={selectedOptionIndex}
                onPress={onDropdownSelect}
                buttons={options}
                buttonStyle={styles.buttons}
                innerBorderStyle={styles.innerBorder}
                containerStyle={styles.buttonGroup}
                textStyle={styles.buttonText}
              />
            </View>
            {rightIconName && (
              <TouchableOpacity
                onPress={() => onRightIconPress && onRightIconPress()}
                style={styles.rightIconWrapper}
              >
                <Icon
                  style={styles.rightIcon}
                  size={iconSize || 28}
                  iconType={rightIconType}
                  name={rightIconName}
                />
              </TouchableOpacity>
            )}
          </View>
        </LineBreak>
      )}
    </View>
  );

export default FilterBarView;
