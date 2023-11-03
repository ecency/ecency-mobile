import React, { Fragment } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { MainButton, Icon } from '../../../components';
import styles from '../styles/claimButton.styles';

interface ClaimButtonProps {
  title: string;
  isLoading?: boolean;
  isClaiming?: boolean;
  isDisabled?: boolean;
  containerStyle: ViewStyle;
  onPress: () => void;
}

export const ClaimButton = ({
  title,
  isLoading,
  isClaiming,
  isDisabled,
  containerStyle,
  onPress,
}: ClaimButtonProps) => {
  return (
    <View style={{ ...styles.claimContainer, ...containerStyle }}>
      <MainButton
        isLoading={isClaiming}
        isDisable={isDisabled || isLoading || isClaiming}
        style={styles.claimBtn}
        height={40}
        onPress={onPress}
      >
        <Fragment>
          <Text style={styles.claimBtnTitle}>{title}</Text>
          <View style={styles.claimIconWrapper}>
            <Icon
              name="add"
              iconType="MaterialIcons"
              color={EStyleSheet.value('$primaryBlue')}
              size={20}
            />
          </View>
        </Fragment>
      </MainButton>
    </View>
  );
};
