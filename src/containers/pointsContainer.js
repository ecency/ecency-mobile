import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { connect, useDispatch } from 'react-redux';
import get from 'lodash/get';
import { useIntl } from 'react-intl';

// Services and Actions
import { useNavigation } from '@react-navigation/native';
import { getPointsSummary, claimPoints, getPointsHistory } from '../providers/ecency/ePoint';
import { getAccount, boost } from '../providers/hive/dhive';
import { getUserDataWithUsername } from '../realm/realm';
import { toastNotification } from '../redux/actions/uiAction';

// Constant
import POINTS from '../constants/options/points';

// Constants
import ROUTES from '../constants/routeNames';

// Utils
import { groomingPointsTransactionData, getPointsEstimate } from '../utils/wallet';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

const PointsContainer = ({
  username,
  isConnected,
  children,
  accounts,
  currentAccount,
  user,
  activeBottomTab,
  isPinCodeOpen,
  globalProps,
  pinCode,
  currency,
  route,
}) => {
  const navigation = useNavigation();

  const [userPoints, setUserPoints] = useState({});
  const [userActivities, setUserActivities] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [estimatedEstm, setEstimatedEstm] = useState(0);
  const [navigationParams, setNavigationParams] = useState({});
  const [balance, setBalance] = useState(0);
  const intl = useIntl();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isConnected) {
      _fetchUserPointActivities(username);
    }

    if (route && route.params) {
      const _navigationParams = route.params;

      setNavigationParams(_navigationParams);
    }
  }, [_fetchUserPointActivities, isConnected, route, username]);

  useEffect(() => {
    if (isConnected && activeBottomTab === ROUTES.TABBAR.WALLET && username) {
      _fetchUserPointActivities(username);
    }
  }, [isConnected, username, _fetchUserPointActivities, activeBottomTab]);

  // Component Functions

  const _handleOnDropdownSelected = (index) => {
    let navigateTo;
    let navigateParams;

    if (index === 'dropdown_transfer') {
      navigateTo = ROUTES.SCREENS.TRANSFER;
      navigateParams = {
        transferType: 'points',
        fundType: 'ESTM',
        balance,
      };
    }
    if (index === 'dropdown_promote') {
      navigateTo = ROUTES.SCREENS.REDEEM;
      navigateParams = {
        balance,
        redeemType: 'promote',
      };
    }
    if (index === 'dropdown_boost') {
      navigateTo = ROUTES.SCREENS.REDEEM;
      navigateParams = {
        balance,
        redeemType: 'boost_plus',
      };
    }

    if (isPinCodeOpen) {
      navigation.navigate({
        name: ROUTES.SCREENS.PINCODE,
        params: {
          navigateTo,
          navigateParams,
        },
      });
    } else {
      navigation.navigate({
        name: navigateTo,
        params: navigateParams,
      });
    }
  };

  const _groomUserActivities = (_userActivities) =>
    _userActivities.map((item) =>
      groomingPointsTransactionData({
        ...item,
        icon: get(POINTS[get(item, 'type')], 'icon'),
        iconType: get(POINTS[get(item, 'type')], 'iconType'),
        textKey: get(POINTS[get(item, 'type')], 'textKey'),
      }),
    );

  const _fetchUserPointActivities = useCallback(async (_username = username) => {
    if (!_username) {
      return;
    }
    setRefreshing(true);

    await getPointsSummary(_username)
      .then(async (userPointsP) => {
        const _balance = Math.round(get(userPointsP, 'points') * 1000) / 1000;
        setUserPoints(userPointsP);
        setBalance(_balance);
        setEstimatedEstm(await getPointsEstimate(_balance, currency));
      })
      .catch((err) => {
        Alert.alert(get(err, 'message', 'Error'));
      });

    await getPointsHistory(_username)
      .then((userActivitiesP) => {
        if (Object.entries(userActivitiesP).length !== 0) {
          setUserActivities(_groomUserActivities(userActivitiesP));
        }
      })
      .catch((err) => {
        if (err) {
          Alert.alert(get(err, 'message') || err.toString());
        }
      });

    setRefreshing(false);
    setIsLoading(false);
  }, []);

  const _getUserBalance = async (_username) => {
    await getPointsSummary(_username)
      .then((_userPoints) => {
        const _balance = Math.round(get(_userPoints, 'points') * 1000) / 1000;
        return _balance;
      })
      .catch((err) => {
        if (err) {
          Alert.alert(get(err, 'message') || err.toString());
        }
      });
  };

  const _claimPoints = async () => {
    setIsClaiming(true);

    await claimPoints()
      .then(() => {
        _fetchUserPointActivities(username);
      })
      .catch((error) => {
        if (error) {
          Alert.alert(
            `PointsClaim - Connection issue, try again or write to support@ecency.com \n${error.message.substr(
              0,
              20,
            )}`,
          );
        }
      });

    setIsClaiming(false);
  };

  const _boost = async (point, permlink, author, _user) => {
    setIsLoading(true);

    await boost(_user || currentAccount, pinCode, point, permlink, author)
      .then(() => {
        setIsLoading(false);
        navigation.goBack();
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
      })
      .catch((error) => {
        if (error) {
          setIsLoading(false);
          dispatch(toastNotification(intl.formatMessage({ id: 'alert.key_warning' })));
        }
      });
  };

  const _getESTMPrice = (points) => {
    return points / 150;
  };

  return (
    children &&
    children({
      accounts,
      balance,
      boost: _boost,
      claim: _claimPoints,
      currentAccount,
      currentAccountName: currentAccount.name,
      fetchUserActivity: _fetchUserPointActivities,
      getAccount,
      getESTMPrice: _getESTMPrice,
      getUserBalance: _getUserBalance,
      getUserDataWithUsername,
      handleOnDropdownSelected: _handleOnDropdownSelected,
      isClaiming,
      isLoading,
      navigationParams,
      refreshing,
      userActivities,
      userPoints,
      estimatedEstm,
      redeemType: get(navigationParams, 'redeemType'),
      user,
      dropdownOptions: ['dropdown_transfer', 'dropdown_promote', 'dropdown_boost'],
    })
  );
};

const mapStateToProps = (state) => ({
  user: state.account.currentAccount,
  username: state.account.currentAccount.name,
  activeBottomTab: state.ui.activeBottomTab,
  isConnected: state.application.isConnected,
  accounts: state.account.otherAccounts,
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  isPinCodeOpen: state.application.isPinCodeOpen,
  globalProps: state.account.globalProps,
  currency: state.application.currency.currency,
});

export default connect(mapStateToProps)(PointsContainer);
