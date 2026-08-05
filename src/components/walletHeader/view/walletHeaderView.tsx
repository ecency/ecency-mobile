import React, { useRef, Fragment, useEffect } from 'react';
import { Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Components
import { useNavigation } from '@react-navigation/native';
import { Icon, MainButton, DropdownButton, WalletLineItem } from '../..';
import { useAppSelector } from '../../../hooks';
import { selectCurrentAccount } from '../../../redux/selectors';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Styles
import styles from './walletHeaderStyles';

const WalletHeaderView = ({
  claim,
  isClaiming,
  handleOnDropdownSelected,
  unclaimedBalance,
  userBalance,
  type = '',
  componentDidUpdate,
  currentIndex,
  valueDescriptions,
  showBuyButton,
  showAddressButton,
  index,
  fetchUserActivity,
  getTokenAddress,
  reload,
  refreshing,
}: any) => {
  const navigation = useNavigation();

  const intl = useIntl();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const dropdownRef = useRef<any>(null);

  useEffect(() => {
    if (index === currentIndex) {
      componentDidUpdate();
    }
  }, [componentDidUpdate, currentIndex, index]);

  useEffect(() => {
    if (reload && fetchUserActivity && index === currentIndex) {
      fetchUserActivity();
    }
  }, [reload, currentIndex, index]);

  useEffect(() => {
    if (reload && !refreshing && index === currentIndex) {
      componentDidUpdate();
    }
  }, [reload]);

  const _getBalanceItem = (balance: any, options: any, _key: any) =>
    balance !== undefined && (
      <View style={styles.balanceWrapper} key={balance + _key}>
        <Text style={styles.balanceText}>{balance}</Text>
        <DropdownButton
          dropdownRef={dropdownRef}
          isHasChildIcon
          iconName="arrow-drop-down"
          options={options.map((itemKey: any) =>
            intl.formatMessage({ id: `wallet.${itemKey}` }).toUpperCase(),
          )}
          noHighlight
          dropdownButtonStyle={styles.dropdownButtonStyle}
          onSelect={(selectedIndex: any) => handleOnDropdownSelected(options[selectedIndex])}
          iconStyle={styles.dropdownIconStyle}
        />
        <Text style={styles.subText}>{intl.formatMessage({ id: `wallet.${_key}.title` })}</Text>
      </View>
    );

  return (
    <Fragment>
      <View
        style={styles.scrollContainer}
        {...({ contentContainerStyle: styles.scrollContentContainer } as any)}
      >
        {userBalance.map((item: any) =>
          _getBalanceItem(
            get(item, 'balance', 0),
            get(item, 'options', []),
            get(item, 'nameKey', 'estm'),
          ),
        )}

        {showBuyButton && (
          <MainButton
            isLoading={isClaiming}
            isDisable={isClaiming}
            style={styles.mainButton}
            height={50}
            onPress={() =>
              unclaimedBalance
                ? claim()
                : navigation.navigate(ROUTES.SCREENS.BOOST, {
                    username: currentAccount?.name,
                  })
            }
          >
            <View style={styles.mainButtonWrapper}>
              <Text style={styles.unclaimedText}>
                {unclaimedBalance || intl.formatMessage({ id: `wallet.${type}.buy` })}
              </Text>
              <View style={styles.mainIconWrapper}>
                <Icon name="add" iconType="MaterialIcons" color="#357ce6" size={23} />
              </View>
            </View>
          </MainButton>
        )}

        {showAddressButton && (
          <MainButton
            isLoading={isClaiming}
            isDisable={isClaiming}
            style={styles.mainButton}
            height={50}
            onPress={() => getTokenAddress()}
          >
            <View style={styles.mainButtonWrapper}>
              <Text style={styles.unclaimedText}>
                {intl.formatMessage({ id: `wallet.${type}.address` })}
              </Text>
              <View style={styles.mainIconWrapper}>
                <Icon name="qrcode" iconType="MaterialCommunityIcons" color="#357ce6" size={23} />
              </View>
            </View>
          </MainButton>
        )}

        {valueDescriptions &&
          valueDescriptions.map((item: any, _index: any) => (
            <WalletLineItem
              key={`keyl-${_index.toString()}`}
              fitContent
              style={styles.valueDescriptions}
              text={intl.formatMessage({ id: `wallet.${get(item, 'textKey')}` })}
              hintDescription={
                get(item, 'subTextKey') &&
                intl.formatMessage({ id: `wallet.${get(item, 'subTextKey')}` })
              }
              rightText={get(item, 'value')}
              hintIconName={get(item, 'subTextKey') && 'information-circle-outline'}
              onPress={get(item, 'onPress')}
              isBlackText
              isThin
            />
          ))}
      </View>
    </Fragment>
  );
};

export default WalletHeaderView;
