import React from 'react';
import { View, Text } from 'react-native';

// Components
import GrayWrapper from '../grayWrapper/grayWrapperView';
import { Icon } from '../../../icon';
import { DropdownButton } from '../../../dropdownButton';

// Styles
import styles from './walletLineItemStyles';

const WalletLineItem = ({
  description,
  fitContent,
  iconName,
  iconType,
  isBlackText,
  isBoldText,
  isCircleIcon,
  isThin,
  rightText,
  rightTextColor,
  text,
  textColor,
  index,
  style,
  isHasdropdown,
  dropdownOptions,
  onDropdownSelect,
  dropdownStyle,
}) => (
  <GrayWrapper isGray={index && index % 2 !== 0}>
    <View style={[styles.container, fitContent && styles.fitContent, style]}>
      <View style={styles.iconTextWrapper}>
        {iconName && (
          <View
            style={[
              styles.iconWrapper,
              isCircleIcon && styles.circleIcon,
              index && { backgroundColor: `${index && index % 2 !== 0 ? 'white' : '#f5f5f5'}` },
            ]}
          >
            <Icon style={styles.icon} name={iconName} iconType={iconType} />
          </View>
        )}
        <View>
          {!!text && (
            <View>
              <Text
                style={[
                  styles.text,
                  !iconName && styles.onlyText,
                  rightText && styles.longText,
                  isBlackText && styles.blackText,
                  textColor && { color: textColor },
                  isBoldText && { fontWeight: 'bold' },
                  isThin && styles.thinText,
                ]}
              >
                {text}
              </Text>
            </View>
          )}
          {!!description && (
            <Text style={[styles.description, !iconName && styles.onlyText]}>{description}</Text>
          )}
        </View>
      </View>
      {rightText && (
        <View style={styles.rightTextWrapper}>
          <Text
            style={[
              styles.rightText,
              rightTextColor ? { color: rightTextColor } : !text && styles.onlyRightText,
            ]}
          >
            {rightText}
          </Text>
        </View>
      )}
      {isHasdropdown && (
        <View style={styles.dropdownWrapper}>
          <DropdownButton
            isHasChildIcon
            iconName="arrow-drop-down"
            options={dropdownOptions}
            noHighlight
            onSelect={onDropdownSelect}
            rowTextStyle={styles.dropdownRowText}
            dropdownStyle={styles.dropdownStyle}
          />
        </View>
      )}
    </View>
  </GrayWrapper>
);

export default WalletLineItem;
