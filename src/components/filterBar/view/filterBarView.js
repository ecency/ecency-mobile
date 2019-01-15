import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Icon } from '../../icon';

// External Components
import { DropdownButton } from '../../dropdownButton';

// Components
import { LineBreak } from '../../basicUIElements';
import { PulseAnimation } from '../../animations';

// Styles
import styles from './filterBarStyles';

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
  rightIconLoading,
}) => (
  <View style={styles.container}>
    {!isHide && (
      <LineBreak height={38}>
        <View style={styles.filterBarWrapper}>
          <DropdownButton
            iconName={dropdownIconName}
            options={options}
            defaultText={defaultText}
            onSelect={onDropdownSelect}
            selectedOptionIndex={selectedOptionIndex}
          />
          {rightIconName && !rightIconLoading && (
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
          {rightIconName && rightIconLoading && (
            <View style={styles.rightIconWrapper}>
              <PulseAnimation
                color="#357ce6"
                numPulses={1}
                diameter={20}
                speed={100}
                duration={100}
                isShow={!rightIconLoading}
              />
            </View>
          )}
        </View>
      </LineBreak>
    )}
  </View>
);

export default FilterBarView;
