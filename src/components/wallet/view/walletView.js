/* eslint-disable react/jsx-wrap-multilines */
import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useIntl } from 'react-intl';
// Components
import { Icon } from '../../icon';
import { MainButton } from '../../mainButton';
import { CollapsibleCard } from '../../collapsibleCard';
import { WalletDetails } from '../../walletDetails';
import { WalletDetailsPlaceHolder } from '../../basicUIElements';


// Styles
import styles from './walletStyles';

const WalletView = ({ setEstimatedWalletValue, selectedUser, handleOnScroll }) => {
  const isDarkTheme = useSelector((state) => state.application.isDarkTheme);
  const intl = useIntl();

  const _getUnclaimedText = (walletData, isPreview) => (
    <Text style={[isPreview ? styles.unclaimedTextPreview : styles.unclaimedText]}>
      {walletData.rewardHiveBalance
        ? `${Math.round(walletData.rewardHiveBalance * 1000) / 1000} HIVE`
        : ''}
      {walletData.rewardHbdBalance
        ? ` ${Math.round(walletData.rewardHbdBalance * 1000) / 1000} HBD`
        : ''}
      {walletData.rewardVestingHive
        ? ` ${Math.round(walletData.rewardVestingHive * 1000) / 1000} HP`
        : ''}
    </Text>
  );

  return (
    <WalletContainer
      setEstimatedWalletValue={setEstimatedWalletValue}
      selectedUser={selectedUser}
      handleOnScroll={handleOnScroll}
    >
      {({
        isClaiming,
        claimRewardBalance,
        currentAccountUsername,
        handleOnWalletRefresh,
        refreshing,
        selectedUsername,
        walletData,
        userActivities,
      }) => (
        <ScrollView
          onScroll={handleOnScroll && handleOnScroll}
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleOnWalletRefresh}
              progressBackgroundColor="#357CE6"
              tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
              titleColor="#fff"
              colors={['#fff']}
            />
          }
          contentContainerStyle={styles.scrollContentContainer}
          scrollEventThrottle={16}
        >
          {!walletData ? (
            <Fragment>
              <WalletDetailsPlaceHolder />
            </Fragment>
          ) : (
            <Fragment>
              {walletData.hasUnclaimedRewards && (
                <CollapsibleCard
                  titleColor="#788187"
                  isBoldTitle
                  defaultTitle={intl.formatMessage({
                    id: 'profile.unclaimed_rewards',
                  })}
                  expanded
                >
                  {currentAccountUsername === selectedUsername ? (
                    <MainButton
                      isLoading={isClaiming}
                      isDisable={isClaiming}
                      style={styles.mainButton}
                      height={50}
                      onPress={() => claimRewardBalance()}
                    >
                      <View style={styles.mainButtonWrapper}>
                        {_getUnclaimedText(walletData)}
                        <View style={styles.mainIconWrapper}>
                          <Icon name="add" iconType="MaterialIcons" color="#357ce6" size={23} />
                        </View>
                      </View>
                    </MainButton>
                  ) : (
                    _getUnclaimedText(walletData, true)
                  )}
                </CollapsibleCard>
              )}

              <CollapsibleCard
                titleColor="#788187"
                title={intl.formatMessage({
                  id: 'profile.wallet_details',
                })}
                expanded
              >
                <WalletDetails intl={intl} walletData={walletData} isShowDropdowns={false} />
              </CollapsibleCard>
            </Fragment>
          )}
        </ScrollView>

      )}
    </WalletContainer>
  );
};

export default WalletView;
/* eslint-enable */
