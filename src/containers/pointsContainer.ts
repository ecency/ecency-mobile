import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { connect, useDispatch } from 'react-redux';
import get from 'lodash/get';
import { useIntl } from 'react-intl';

// Services and Actions
import { useNavigation } from '@react-navigation/native';
import { getAccountsQueryOptions } from '@ecency/sdk';
import {
  selectCurrentAccount,
  selectGlobalProps,
  selectCurrency,
  selectPin,
  selectIsPinCodeOpen,
  selectOtherAccounts,
  selectIsConnected,
  selectActiveBottomTab,
} from '../redux/selectors';
import { claimPoints } from '../providers/ecency/ePoint';
import { boost, buildBoostOpArr } from '../providers/hive/dhive';
import { getQueryClient } from '../providers/queries';
import { getUserDataWithUsername } from '../realm/realm';
import { toastNotification } from '../redux/actions/uiAction';
import { useGetPointsQuery } from '../providers/queries/pointQueries';
import { useActiveKeyOperation } from '../hooks';

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
  pinCode,
  currency,
  route,
}) => {
  const navigation = useNavigation();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { executeOperation } = useActiveKeyOperation();

  // Use SDK query for points data
  const pointsQuery = useGetPointsQuery(username);

  const [userPoints, setUserPoints] = useState({});
  const [userActivities, setUserActivities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [estimatedEstm, setEstimatedEstm] = useState(0);
  const [navigationParams, setNavigationParams] = useState({});
  const [balance, setBalance] = useState(0);

  // Helper function to groom user activities
  const _groomUserActivities = useCallback(
    (_userActivities) =>
      _userActivities.map((item) => {
        const pointType = POINTS[get(item, 'type')] || POINTS.default;
        return groomingPointsTransactionData({
          ...item,
          icon: get(pointType, 'icon'),
          iconType: get(pointType, 'iconType'),
          textKey: get(pointType, 'textKey'),
        });
      }),
    [],
  );

  // Update state when points query data changes
  useEffect(() => {
    if (pointsQuery.isError) {
      if (__DEV__) {
        console.error('Points query error:', pointsQuery.error);
      }
      setIsLoading(false);
      setRefreshing(false);
      setUserActivities([]);
      setBalance(0);
      setUserPoints({});
      setEstimatedEstm(0);
      return;
    }

    if (pointsQuery.data) {
      const normalizedPoints = String(pointsQuery.data.points ?? '').replace(/,/g, '');
      const _balance = Math.round(parseFloat(normalizedPoints) * 1000) / 1000;
      setBalance(_balance);
      setUserPoints({
        points: pointsQuery.data.points,
        unclaimed_points: pointsQuery.data.uPoints,
      });

      if (pointsQuery.data.transactions && Array.isArray(pointsQuery.data.transactions)) {
        const groomed = _groomUserActivities(pointsQuery.data.transactions);
        setUserActivities(groomed);
      } else {
        setUserActivities([]);
      }

      // Update estimated value
      getPointsEstimate(_balance, currency).then(setEstimatedEstm);
    }

    setIsLoading(pointsQuery.isLoading);
    setRefreshing(pointsQuery.isFetching && !pointsQuery.isLoading);
  }, [
    pointsQuery.data,
    pointsQuery.isLoading,
    pointsQuery.isFetching,
    pointsQuery.isError,
    pointsQuery.error,
    currency,
    _groomUserActivities,
  ]);

  useEffect(() => {
    if (route && route.params) {
      const _navigationParams = route.params;
      setNavigationParams(_navigationParams);
    }
  }, [route]);

  useEffect(() => {
    if (isConnected && activeBottomTab === ROUTES.TABBAR.WALLET && username) {
      pointsQuery.refetch();
    }
  }, [isConnected, username, activeBottomTab]);

  // Component Functions

  const _handleOnDropdownSelected = (index) => {
    let navigateTo;
    let navigateParams;

    if (index === 'dropdown_transfer') {
      navigateTo = ROUTES.SCREENS.TRANSFER;
      navigateParams = {
        transferType: 'points',
        fundType: 'POINT',
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

  const _fetchUserPointActivities = useCallback(
    async (_username = username) => {
      if (!_username) {
        return;
      }
      // Refetch using SDK query
      await pointsQuery.refetch();
    },
    [username, pointsQuery],
  );

  const _getUserBalance = async (_username) => {
    // Refetch points data to get latest balance
    const result = await pointsQuery.refetch();
    if (result.data) {
      const _balance = Math.round(parseFloat(result.data.points) * 1000) / 1000;
      return _balance;
    }
    return 0;
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
    const account = _user || currentAccount;
    const username = get(account, 'name');

    setIsLoading(true);

    try {
      const operations = buildBoostOpArr(username, point, author, permlink);

      await executeOperation({
        operations,
        privateKeyHandler: () => boost(account, pinCode, point, author, permlink),
        callbacks: {
          onSuccess: () => {
            setIsLoading(false);
            navigation.goBack();
            dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
          },
          onError: (_error) => {
            setIsLoading(false);
            dispatch(toastNotification(intl.formatMessage({ id: 'alert.key_warning' })));
          },
          onClose: () => {
            setIsLoading(false);
          },
        },
      });
    } catch (error) {
      // Error already handled in callbacks
      setIsLoading(false);
    }
  };

  const _getESTMPrice = (points) => {
    return points / 150;
  };

  const _getAccount = async (username: string) => {
    const queryClient = getQueryClient();
    const accounts = await queryClient.fetchQuery(getAccountsQueryOptions([username]));
    return accounts[0];
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
      getAccount: _getAccount,
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
  user: selectCurrentAccount(state),
  username: selectCurrentAccount(state).name,
  activeBottomTab: selectActiveBottomTab(state),
  isConnected: selectIsConnected(state),
  accounts: selectOtherAccounts(state),
  currentAccount: selectCurrentAccount(state),
  pinCode: selectPin(state),
  isPinCodeOpen: selectIsPinCodeOpen(state),
  globalProps: selectGlobalProps(state),
  currency: selectCurrency(state).currency,
});

export default connect(mapStateToProps)(PointsContainer);
