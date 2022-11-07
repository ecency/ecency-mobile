import React from 'react';
import { View } from 'react-native';

// Components
import { LineBreak, Tag } from '../../basicUIElements';

// Styles
import styles from './filterBarStyles';
import IconButton from '../../iconButton';

/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

interface FilterBarProps {
  isHide: boolean;
  options: string[];
  selectedOptionIndex: number;
  onDropdownSelect: (index: number) => void;

  // optional props
  iconSize?: number;
  rightIconName?: string;
  rightIconType?: string;
  enableCustomiseButton?: boolean;
  onRightIconPress?: () => void;
  onCustomisePress?: () => void;
}

const FilterBarView = ({
  iconSize,
  isHide,
  onDropdownSelect,
  onRightIconPress,
  options,
  rightIconName,
  rightIconType,
  selectedOptionIndex,
  enableCustomiseButton,
  onCustomisePress,
}: FilterBarProps) => {
  const _renderActionButtons = () =>
    rightIconName || enableCustomiseButton ? (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {enableCustomiseButton && (
          <IconButton
            iconStyle={styles.rightIcon}
            style={styles.rightIconWrapper}
            iconType="MaterialIcon"
            size={iconSize || 28}
            name="add"
            onPress={() => onCustomisePress && onCustomisePress()}
          />
        )}
        {rightIconName && (
          <IconButton
            iconStyle={styles.rightIcon}
            style={styles.rightIconWrapper}
            size={iconSize || 28}
            name={rightIconName}
            iconType={rightIconType}
            onPress={() => onRightIconPress && onRightIconPress()}
          />
        )}
      </View>
    ) : (
      <View style={styles.rightIconPlaceholder} />
    );

  return (
    <View style={styles.container}>
      {!isHide && (
        <LineBreak height={38}>
          <View style={styles.filterBarWrapper}>
            <View style={styles.dropdownWrapper}>
              {options.map((item, index) => (
                <Tag
                  key={index.toString()}
                  value={item}
                  isFilter
                  isPin={index === selectedOptionIndex}
                  onPress={() => onDropdownSelect(index)}
                />
              ))}
            </View>
            {_renderActionButtons()}
          </View>
        </LineBreak>
      )}
    </View>
  );
};

export default FilterBarView;
