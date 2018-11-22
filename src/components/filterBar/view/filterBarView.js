import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// External Components
import { DropdownButton } from '../../dropdownButton';

// Components
import { LineBreak } from '../../basicUIElements';

// Styles
import styles from './filterBarStyles';

/* Props
* ------------------------------------------------
*   @prop { type }    name                - Description....
*/

const FilterBarView = ({
  rightIconName,
  options,
  defaultText,
  dropdownIconName,
  onDropdownSelect,
  onRightIconPress,
  selectedOptionIndex,
  isHide,
  iconSize,
}) => (
  <View style={styles.container}>
    {!isHide && (
      <LineBreak color="#f6f6f6" height={35}>
        <View style={styles.filterBarWrapper}>
          <DropdownButton
            iconName={dropdownIconName}
            options={options}
            defaultText={defaultText}
            onSelect={onDropdownSelect}
            selectedOptionIndex={selectedOptionIndex}
          />
          <TouchableOpacity
            onPress={onRightIconPress && onRightIconPress()}
            style={styles.rightIconWrapper}
          >
            <Ionicons style={styles.rightIcon} size={iconSize || 32} name={rightIconName} />
          </TouchableOpacity>
        </View>
      </LineBreak>
    )}
  </View>
);

export default FilterBarView;
