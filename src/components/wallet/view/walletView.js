/* eslint-disable react/jsx-wrap-multilines */
import React, { Fragment } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useIntl } from 'react-intl';

// Components
import { Icon } from '../../icon';
import { MainButton } from '../../mainButton';
import { CollapsibleCard } from '../../collapsibleCard';
import { WalletDetails } from '../../walletDetails';
import { Transaction } from '../../transaction';
import { WalletDetailsPlaceHolder, Card } from '../../basicUIElements';
import { ThemeContainer, SteemWalletContainer } from '../../../containers';

// Styles
import styles from './walletStyles';

const WalletView = ({ setEstimatedWalletValue, selectedUser, handleOnScroll }) => {
  const intl = useIntl();

  const _getUnclaimedText = (walletData, isPreview) => (
    <Text style={[isPreview ? styles.unclaimedTextPreview : styles.unclaimedText]}>
      {walletData.rewardSteemBalance
        ? `${Math.round(walletData.rewardSteemBalance * 1000) / 1000} STEEM`
        : ''}
      {walletData.rewardSbdBalance
        ? ` ${Math.round(walletData.rewardSbdBalance * 1000) / 1000} SBD`
        : ''}
      {walletData.rewardVestingSteem
        ? ` ${Math.round(walletData.rewardVestingSteem * 1000) / 1000} SP`
        : ''}
    </Text>
  );

  return (
    <SteemWalletContainer
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
        <ThemeContainer>
          {isDarkTheme => (
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
                    <WalletDetails
                      intl={intl}
                      walletData={walletData}
                      isShowDropdowns={currentAccountUsername === selectedUsername}
                    />
                  </CollapsibleCard>
                  <Card>
                    <Transaction
                      refreshing={refreshing}
                      type="wallet"
                      transactions={userActivities}
                    />
                  </Card>
                </Fragment>
              )}
            </ScrollView>
          )}
        </ThemeContainer>
      )}
    </SteemWalletContainer>
  );
};

export default WalletView;
