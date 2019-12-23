/* eslint-disable react/jsx-wrap-multilines */
import React, { useRef, Fragment, useEffect } from 'react';
import { Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import { withNavigation } from 'react-navigation';
import get from 'lodash/get';

// Components
import { Icon, MainButton, DropdownButton, HorizontalIconList, WalletLineItem } from '../..';

// Constants
import POINTS, { POINTS_KEYS } from '../../../constants/options/points';
import { default as ROUTES } from '../../../constants/routeNames';

// Styles
import styles from './walletHeaderStyles';

const WalletHeaderView = ({
  claim,
  isClaiming,
  handleOnDropdownSelected,
  navigation,
  unclaimedBalance,
  userBalance,
  type = '',
  componentDidUpdate,
  showIconList,
  currentIndex,
  valueDescriptions,
  showBuyButton,
  index,
  fetchUserActivity,
  reload,
  refreshing,
}) => {
  const intl = useIntl();
  const dropdownRef = useRef();

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

  const _getBalanceItem = (balance, options, _key) =>
    balance !== undefined && (
      <View style={styles.balanceWrapper} key={balance + _key}>
        <Text style={styles.balanceText}>{balance}</Text>
        <DropdownButton
          dropdownRowWrapper={styles.dropdownRowStyle}
          dropdownRef={dropdownRef}
          isHasChildIcon
          iconName="arrow-drop-down"
          options={options.map(itemKey => intl.formatMessage({ id: `wallet.${itemKey}` }))}
          noHighlight
          dropdownButtonStyle={styles.dropdownButtonStyle}
          onSelect={selectedIndex => handleOnDropdownSelected(options[selectedIndex])}
          rowTextStyle={styles.dropdownRowText}
          dropdownStyle={styles.dropdownStyle}
          iconStyle={styles.dropdownIconStyle}
        />
        <Text style={styles.subText}>{intl.formatMessage({ id: `wallet.${_key}.title` })}</Text>
      </View>
    );

  return (
    <Fragment>
      <View style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
        {userBalance.map(item =>
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
            onPress={() => (unclaimedBalance ? claim() : navigation.navigate(ROUTES.SCREENS.BOOST))}
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

        {valueDescriptions &&
          valueDescriptions.map((item, _index) => (
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
              hintIconName={get(item, 'subTextKey') && 'ios-information-circle-outline'}
              isBlackText
              isThin
            />
          ))}
      </View>
    </Fragment>
  );
};

export default withNavigation(WalletHeaderView);
/* eslint-enable */
