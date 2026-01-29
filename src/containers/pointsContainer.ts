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
import { boost } from '../providers/hive/dhive';
import { getQueryClient } from '../providers/queries';
import { getUserDataWithUsername } from '../realm/realm';
import { toastNotification } from '../redux/actions/uiAction';
import { useGetPointsQuery } from '../providers/queries/pointQueries';

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

  // Use SDK query for points data
  console.log('PointsContainer - username:', username, 'isConnected:', isConnected);
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
      _userActivities.map((item) =>
        groomingPointsTransactionData({
          ...item,
          icon: get(POINTS[get(item, 'type')], 'icon'),
          iconType: get(POINTS[get(item, 'type')], 'iconType'),
          textKey: get(POINTS[get(item, 'type')], 'textKey'),
        }),
      ),
    [],
  );

  // Update state when points query data changes
  useEffect(() => {
    console.log('Points query status:', {
      isLoading: pointsQuery.isLoading,
      isFetching: pointsQuery.isFetching,
      isError: pointsQuery.isError,
      error: pointsQuery.error,
      hasData: !!pointsQuery.data,
    });

    if (pointsQuery.isError) {
      console.error('Points query error:', pointsQuery.error);
      setIsLoading(false);
      setRefreshing(false);
      setUserActivities([]);
      return;
    }

    if (pointsQuery.data) {
      console.log('Points query data:', pointsQuery.data);
      const _balance = Math.round(parseFloat(pointsQuery.data.points) * 1000) / 1000;
      setBalance(_balance);
      setUserPoints({
        points: pointsQuery.data.points,
        unclaimed_points: pointsQuery.data.uPoints,
      });

      if (pointsQuery.data.transactions && Array.isArray(pointsQuery.data.transactions)) {
        const groomed = _groomUserActivities(pointsQuery.data.transactions);
        console.log('Groomed transactions:', groomed.length);
        setUserActivities(groomed);
      } else {
        console.log('No transactions data');
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
