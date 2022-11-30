import React, { Fragment } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { MainButton, Icon } from '../../../components';
import styles from '../styles/claimButton.styles';

interface ClaimButtonProps {
  title: string;
  isLoading?: boolean;
  isClaiming?: boolean;
  isClaimExpected?: boolean;
  isDisabled?: boolean;
  onPress: () => void;
}

export const ClaimButton = ({
  title,
  isLoading,
  isClaiming,
  isClaimExpected,
  isDisabled,
  onPress,
}: ClaimButtonProps) => {
  const _rightComponent = isLoading ? (
    <ActivityIndicator
      color={EStyleSheet.value('$pureWhite')}
      style={styles.claimActivityIndicator}
    />
  ) : (
    <View style={styles.claimIconWrapper}>
      <Icon
        name="add"
        iconType="MaterialIcons"
        color={EStyleSheet.value('$primaryBlue')}
        size={23}
      />
    </View>
  );

  return (
    <View style={styles.claimContainer}>
      <MainButton
        isLoading={isClaiming && isClaimExpected}
        isDisable={isDisabled || isLoading || (isClaiming && isClaimExpected)}
        style={styles.claimBtn}
        height={50}
        onPress={onPress}
      >
        <Fragment>
          <Text style={styles.claimBtnTitle}>{title}</Text>
          {_rightComponent}
        </Fragment>
      </MainButton>
    </View>
  );
};
