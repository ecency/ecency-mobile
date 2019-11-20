/* eslint-disable react/jsx-wrap-multilines */
import React, { useRef, Fragment, useEffect } from 'react';
import { Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import { withNavigation } from 'react-navigation';
import get from 'lodash/get';

// Components
import { LineBreak } from '../../basicUIElements';
import { Icon, MainButton, DropdownButton, HorizontalIconList, WalletLineItem } from '../..';

// Constants
import POINTS, { POINTS_KEYS } from '../../../constants/options/points';
import { default as ROUTES } from '../../../constants/routeNames';

// Styles
import styles from './pointsStyles';

const PointsView = ({
  fetchUserActivity,
  refreshing,
  isLoading,
  claim,
  isClaiming,
  userActivities,
  handleOnDropdownSelected,
  navigation,
  unclaimedBalance,
  userBalance,
  type = '',
  componentDidUpdate,
  showIconList,
  currentIndex,
  userSecondBalance,
  secondBalanceName,
  valueDescriptions,
  showBuyButton,
  index,
}) => {
  const intl = useIntl();
  const dropdownRef = useRef();

  useEffect(() => {
    if (index === currentIndex) {
      componentDidUpdate();
    }
  }, [componentDidUpdate, currentIndex, index]);

  // onPress={() => dropdownRef.current.show()}
  const _getBalanceItem = (balance, options, key) =>
    balance !== undefined && (
      <View style={styles.balanceWrapper}>
        <Text style={styles.balanceText}>{balance}</Text>
        <DropdownButton
          dropdownRowWrapper={styles.dropdownRowStyle}
          dropdownRef={dropdownRef}
          isHasChildIcon
          iconName="arrow-drop-down"
          options={options.map(itemKey => intl.formatMessage({ id: `wallet.${itemKey}` }))}
          noHighlight
          dropdownButtonStyle={styles.dropdownButtonStyle}
          onSelect={handleOnDropdownSelected}
          rowTextStyle={styles.dropdownRowText}
          dropdownStyle={styles.dropdownStyle}
          iconStyle={styles.dropdownIconStyle}
        />
        <Text style={styles.subText}>{intl.formatMessage({ id: `wallet.${key}.title` })}</Text>
      </View>
    );

  return (
    <Fragment>
      <LineBreak height={12} />
      <View style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
        {userBalance.map(item =>
          _getBalanceItem(
            get(item, 'balance', 0),
            get(item, 'options', []),
            get(item, 'nameKey', 'estm'),
          ),
        )}

        {(showBuyButton || (!showBuyButton && !!unclaimedBalance)) && (
          <MainButton
            isLoading={isClaiming}
            isDisable={isClaiming}
            style={styles.mainButton}
            height={50}
            onPress={() =>
              unclaimedBalance > 0 ? claim() : navigation.navigate(ROUTES.SCREENS.BOOST)
            }
          >
            <View style={styles.mainButtonWrapper}>
              <Text style={styles.unclaimedText}>
                {unclaimedBalance > 0
                  ? unclaimedBalance
                  : intl.formatMessage({ id: `wallet.${type}.buy` })}
              </Text>
              <View style={styles.mainIconWrapper}>
                <Icon name="add" iconType="MaterialIcons" color="#357ce6" size={23} />
              </View>
            </View>
          </MainButton>
        )}

        {/* {valueDescriptions && } */}
        {valueDescriptions &&
          valueDescriptions.map(item => (
            <WalletLineItem
              fitContent
              style={styles.valueDescriptions}
              text={intl.formatMessage({ id: `wallet.${get(item, 'textKey')}` })}
              description={
                get(item, 'subTextKey') &&
                intl.formatMessage({ id: `wallet.${get(item, 'subTextKey')}` })
              }
              rightText={get(item, 'value')}
              isBlackText
              isThin
            />
          ))}
        {showIconList && <HorizontalIconList options={POINTS} optionsKeys={POINTS_KEYS} />}
      </View>
    </Fragment>
  );
};

export default withNavigation(PointsView);

// const refreshControl = () => (
//   <ThemeContainer>
//     {isDarkTheme => (
//       <RefreshControl
//         refreshing={refreshing}
//         onRefresh={fetchUserActivity}
//         progressBackgroundColor="#357CE6"
//         tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
//         titleColor="#fff"
//         colors={['#fff']}
//       />
//     )}
//   </ThemeContainer>
// );
