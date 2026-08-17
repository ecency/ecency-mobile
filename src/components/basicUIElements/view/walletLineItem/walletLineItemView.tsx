import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Components
import { DropdownButton, PopoverWrapper, Icon, GrayWrapper, IconButton } from '../../..';

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
  hintIconName,
  hintDescription,
  onPress,
  cancelable,
  cancelling,
  onCancelPress,
  onRepeatPress,
  onCopyPress,
  copyAccessibilityLabel,
}: any) => (
  <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.8}>
    <GrayWrapper isGray={index && index % 2 !== 0}>
      <View style={[styles.container, fitContent && styles.fitContent, style]}>
        <View style={styles.iconTextWrapper}>
          {iconName && (
            <View
              style={[
                styles.iconWrapper,
                isCircleIcon && styles.circleIcon,
                index && {
                  backgroundColor: `${
                    index && index % 2 !== 0
                      ? EStyleSheet.value('$white')
                      : EStyleSheet.value('$primaryLightBackground')
                  }`,
                },
              ]}
            >
              <Icon style={styles.icon} name={iconName} iconType={iconType} />
            </View>
          )}
          <View>
            {!!text && (
              <View style={styles.textWrapper}>
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
                {!!hintIconName && (
                  <PopoverWrapper text={hintDescription}>
                    <Icon
                      style={[styles.hintIcon, styles.icon]}
                      name={hintIconName}
                      iconType={iconType}
                    />
                  </PopoverWrapper>
                )}
              </View>
            )}
            {!!description && (
              <Text style={[styles.description, !iconName && styles.onlyText]}>{description}</Text>
            )}
          </View>

          {!!rightText && (
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
        </View>

        <View style={styles.actionBtnWrapper}>
          {!!cancelable && (
            <IconButton
              backgroundColor="transparent"
              name="cancel"
              iconType="MaterialIcons"
              size={20}
              style={styles.cancelIcon}
              onPress={() => {
                onCancelPress && onCancelPress();
              }}
              color="#c1c5c7"
              isLoading={cancelling}
            />
          )}

          {!!onRepeatPress && (
            <IconButton
              backgroundColor="transparent"
              name="repeat"
              iconType="FontAwesome"
              size={18}
              onPress={() => {
                onRepeatPress();
              }}
              color="#c1c5c7"
              isLoading={false}
              style={styles.repeatContainer}
            />
          )}

          {!!onCopyPress && (
            <IconButton
              backgroundColor="transparent"
              name="content-copy"
              iconType="MaterialIcons"
              size={18}
              onPress={() => {
                onCopyPress();
              }}
              // The theme variable rather than the `#c1c5c7` its siblings hardcode: that
              // literal is the light value, so a hardcoded icon stays light-grey on the
              // dark theme. The cancel and repeat buttons above have the same problem and
              // are left alone here, since changing them is a visual change of its own.
              color={EStyleSheet.value('$iconColor')}
              isLoading={false}
              style={styles.repeatContainer}
              accessibilityLabel={copyAccessibilityLabel}
            />
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
      </View>
    </GrayWrapper>
  </TouchableOpacity>
);

export default WalletLineItem;
