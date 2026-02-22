import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

// Services and Actions
import * as Sentry from '@sentry/react-native';
import { useNavigation } from '@react-navigation/native';
import {
  lookupAccountsQueryOptions,
  getAccountsQueryOptions,
  getRecurrentTransfersQueryOptions,
} from '@ecency/sdk';
import { selectCurrentAccount, selectGlobalProps, selectOtherAccounts } from '../redux/selectors';
import { useTransferMutations } from '../hooks';
import { getQueryClient } from '../providers/queries';
import QUERIES from '../providers/queries/queryKeys';
import { toastNotification } from '../redux/actions/uiAction';
import { getUserDataWithUsername } from '../realm/realm';
import { getPointsSummary } from '../providers/ecency/ePoint';

// Utils
import { countDecimals } from '../utils/number';
import { fetchTokenBalances } from '../providers/hive-engine/hiveEngine';
import TransferTypes from '../constants/transferTypes';
import { fetchSpkMarkets } from '../providers/hive-spk/hiveSpk';
import TokenLayers from '../constants/tokenLayers';
/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class TransferContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fundType: props.route.params?.fundType ?? '',
      balance: props.route.params?.balance ?? '',
      tokenAddress: props.route.params?.tokenAddress ?? '',
      transferType: props.route.params?.transferType ?? '',
      referredUsername: props.route.params?.referredUsername,
      selectedAccount: props.currentAccount,
      spkMarkets: [],
      initialAmount: props.route.params?.initialAmount,
      initialMemo: props.route.params?.initialMemo,
      recurrentTransfers: [],
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    const {
      currentAccount: { name },
    } = this.props;

    this.fetchBalance(name);

    this._fetchRecurrentTransfers(name);

    if (this.state.transferType === TransferTypes.DELEGATE_SPK) {
      this._fetchSpkMarkets();
    }
  }

  // Component Functions

  _getUserPointsBalance = async (username) => {
    await getPointsSummary(username)
      .then((userPoints) => {
        const balance = Math.round(get(userPoints, 'points') * 1000) / 1000;
        this.setState({ balance });
      })
      .catch((err) => {
        if (err) {
          alert(get(err, 'message') || err.toString());
        }
      });
  };

  fetchBalance = (username) => {
    const { fundType, transferType, tokenAddress } = this.state;

    // Fetch account using SDK
    const queryClient = getQueryClient();

    queryClient.fetchQuery(getAccountsQueryOptions([username])).then(async (accounts) => {
      const account = accounts[0];
      let balance;

      if (transferType.endsWith('_engine')) {
        const tokenBalances = await fetchTokenBalances(username);

        tokenBalances.forEach((tokenBalance) => {
          if (tokenBalance.symbol === fundType) {
            switch (transferType) {
              case TransferTypes.UNDELEGATE_ENGINE:
                balance = tokenBalance.delegationsOut;
                break;
              case TransferTypes.UNSTAKE_ENGINE:
              case TransferTypes.DELEGATE_ENGINE:
                balance = tokenBalance.stake;
                break;
              default:
                const { balance: _balance } = tokenBalance;
                balance = _balance;
                break;
            }
          }
          if (!balance) {
            balance = '0';
          }
        });

        console.log('retrieved balance', balance);
      } else {
        if (
          (transferType === 'purchase_estm' || transferType === 'transfer_token') &&
          fundType === 'HIVE'
        ) {
          balance = account.balance.replace(fundType, '');
        }
        if (
          (transferType === 'purchase_estm' ||
            transferType === 'convert' ||
            transferType === 'transfer_token') &&
          fundType === 'HBD'
        ) {
          balance = account.hbd_balance.replace(fundType, '');
        }
        if (transferType === TransferTypes.ECENCY_POINT_TRANSFER && fundType === 'POINT') {
          this._getUserPointsBalance(username);
        }
        if (transferType === TransferTypes.TRANSFER_TO_SAVINGS && fundType === 'HIVE') {
          balance = account.balance.replace(fundType, '');
        }
        if (transferType === 'transfer_to_savings' && fundType === 'HBD') {
          balance = account.hbd_balance.replace(fundType, '');
        }
        if (transferType === 'transfer_to_vesting' && fundType === 'HIVE') {
          balance = account.balance.replace(fundType, '');
        }
        if (transferType === 'address_view' && fundType === 'BTC') {
          // TODO implement transfer of custom tokens
          console.log(tokenAddress);
        }
      }

      const local = await getUserDataWithUsername(username);

      if (balance) {
        this.setState({ balance: Number(balance) });
      }

      this.setState({
        selectedAccount: { ...account, local: local[0] },
      });
    });
  };

  _fetchSpkMarkets = async () => {
    const markets = await fetchSpkMarkets();
    if (markets?.list) {
      this.setState({ spkMarkets: markets.list });
    }
  };

  _getAccountsWithUsername = async (username) => {
    const queryClient = getQueryClient();
    const validUsers = await queryClient.fetchQuery(lookupAccountsQueryOptions(username, 20));
    return validUsers;
  };

  _fetchRecurrentTransfers = async (username) => {
    const queryClient = getQueryClient();
    const recTransfers = await queryClient.fetchQuery(getRecurrentTransfersQueryOptions(username));

    this.setState({
      recurrentTransfers: recTransfers,
    });

    return recTransfers;
  };

  _delayedRefreshCoinsData = () => {
    const { currentAccount } = this.props;
    const queryClient = getQueryClient();

    if (!currentAccount?.name) return;

    // Immediately invalidate to show loading state
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === QUERIES.WALLET.GET && query.queryKey[1] === currentAccount.name,
    });
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === 'accounts' &&
        query.queryKey[1] === 'transactions' &&
        query.queryKey[2] === currentAccount.name,
    });
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === 'points' && query.queryKey[1] === currentAccount.name,
    });

    // Wait 3 seconds for blockchain to process, then force refetch all wallet queries
    setTimeout(() => {
      // Refetch portfolio/balance queries for all currencies (forces immediate update)
      queryClient.refetchQueries({
        predicate: (query) =>
          query.queryKey[0] === QUERIES.WALLET.GET && query.queryKey[1] === currentAccount.name,
      });

      // Refetch activities/transactions queries for all assets
      queryClient.refetchQueries({
        predicate: (query) =>
          query.queryKey[0] === QUERIES.WALLET.GET_ACTIVITIES &&
          query.queryKey[1] === currentAccount.name,
      });
      queryClient.refetchQueries({
        predicate: (query) =>
          query.queryKey[0] === 'accounts' &&
          query.queryKey[1] === 'transactions' &&
          query.queryKey[2] === currentAccount.name,
      });
      queryClient.refetchQueries({
        predicate: (query) =>
          query.queryKey[0] === 'points' && query.queryKey[1] === currentAccount.name,
      });

      // Refetch pending requests (conversions, limit orders, savings withdrawals)
      queryClient.refetchQueries({
        queryKey: [QUERIES.WALLET.GET_PENDING_REQUESTS],
      });

      // Refetch recurring transfers for current account only (any coinId)
      queryClient.refetchQueries({
        predicate: (query) =>
          query.queryKey[0] === QUERIES.WALLET.GET_RECURRING_TRANSFERS &&
          query.queryKey[2] === currentAccount.name,
      });
    }, 3000); // 3 second delay for blockchain processing
  };

  _transferToAccount = async (
    from,
    destination,
    amount,
    memo,
    recurrence = null,
    executions = 0,
  ) => {
    const { navigation, dispatch, intl, route, mutations } = this.props;

    const transferType = route.params?.transferType ?? '';
    const fundType = route.params?.fundType ?? '';
    const tokenLayer = route.params?.assetLayer ?? '';

    const data: any = { from, destination, amount, memo, fundType };

    if (recurrence && executions) {
      data.recurrence = +recurrence;
      data.executions = +executions;
    }

    if (countDecimals(Number(data.amount)) < 3) {
      data.amount = Number(data.amount).toFixed(3);
    }

    data.amount = `${data.amount} ${fundType}`;

    const _onSuccess = () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
      this._delayedRefreshCoinsData();
      navigation.goBack();
    };

    const _onError = (error) => {
      navigation.goBack();
      Sentry.captureException(error);
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.key_warning' })));
    };

    try {
      // Handle ENGINE layer
      if (tokenLayer === TokenLayers.ENGINE) {
        const amountNum = data.amount.split(' ')[0];
        switch (transferType) {
          case TransferTypes.TRANSFER:
            await mutations.transferEngine.mutateAsync({
              to: data.destination,
              symbol: fundType,
              quantity: amountNum,
              memo: data.memo,
            });
            break;
          case TransferTypes.STAKE:
            await mutations.stakeEngine.mutateAsync({
              to: data.destination || from,
              symbol: fundType,
              quantity: amountNum,
            });
            break;
          case TransferTypes.DELEGATE:
            await mutations.delegateEngine.mutateAsync({
              to: data.destination,
              symbol: fundType,
              quantity: amountNum,
            });
            break;
          case TransferTypes.UNSTAKE:
            await mutations.unstakeEngine.mutateAsync({
              to: data.destination || from,
              symbol: fundType,
              quantity: amountNum,
            });
            break;
          case TransferTypes.UNDELEGATE:
            await mutations.undelegateEngine.mutateAsync({
              from: data.destination,
              symbol: fundType,
              quantity: amountNum,
            });
            break;
        }
        _onSuccess();
        return;
      }

      // Handle SPK layer
      if (tokenLayer === TokenLayers.SPK) {
        const spkAmount = parseFloat(data.amount);
        switch (transferType) {
          case TransferTypes.TRANSFER_SPK:
            await mutations.transferSpk.mutateAsync({
              to: data.destination,
              amount: spkAmount,
              memo: data.memo,
            });
            break;
          case TransferTypes.TRANSFER_LARYNX:
            await mutations.transferLarynx.mutateAsync({
              to: data.destination,
              amount: spkAmount,
              memo: data.memo,
            });
            break;
          case TransferTypes.POWER_UP_SPK:
            await mutations.powerLarynx.mutateAsync({ mode: 'up', amount: spkAmount });
            break;
          case TransferTypes.POWER_DOWN_SPK:
            await mutations.powerLarynx.mutateAsync({ mode: 'down', amount: spkAmount });
            break;
          case TransferTypes.POWER_GRANT_SPK:
            await mutations.delegateLarynx.mutateAsync({
              destination: data.destination,
              amount: spkAmount,
            });
            break;
        }
        _onSuccess();
        return;
      }

      // Handle HIVE layer
      if (tokenLayer === TokenLayers.HIVE) {
        switch (transferType) {
          case TransferTypes.TRANSFER:
            await mutations.transfer.mutateAsync({
              to: data.destination,
              amount: data.amount,
              memo: data.memo,
            });
            break;
          case TransferTypes.RECURRENT_TRANSFER:
            await mutations.recurrentTransfer.mutateAsync({
              from: data.from,
              to: data.destination,
              amount: data.amount,
              memo: data.memo,
              recurrence: data.recurrence,
              executions: data.executions,
            });
            break;
          case TransferTypes.CONVERT:
            await mutations.convert.mutateAsync({
              amount: data.amount,
              requestId: new Date().getTime() >>> 0,
            });
            break;
          case TransferTypes.TRANSFER_TO_SAVINGS:
            await mutations.transferToSavings.mutateAsync({
              to: data.destination,
              amount: data.amount,
              memo: data.memo,
            });
            break;
          case TransferTypes.TRANSFER_FROM_SAVINGS:
            await mutations.transferFromSavings.mutateAsync({
              to: data.destination,
              amount: data.amount,
              memo: data.memo,
              requestId: new Date().getTime() >>> 0,
            });
            break;
          case TransferTypes.TRANSFER_TO_VESTING:
            await mutations.transferToVesting.mutateAsync({
              to: data.destination,
              amount: data.amount,
            });
            break;
          case TransferTypes.WITHDRAW_VESTING:
            await mutations.withdrawVesting.mutateAsync({
              vestingShares: `${amount.toFixed(6)} VESTS`,
            });
            break;
          case TransferTypes.DELEGATE_VESTING_SHARES:
            await mutations.delegateVestingShares.mutateAsync({
              delegatee: data.destination,
              vestingShares: `${amount.toFixed(6)} VESTS`,
            });
            break;
        }
        _onSuccess();
        return;
      }

      // Handle POINTS layer
      if (tokenLayer === TokenLayers.POINTS) {
        await mutations.transferPoint.mutateAsync({
          to: data.destination,
          amount: data.amount,
          memo: data.memo,
        });
        _onSuccess();
      }
    } catch (error) {
      _onError(error);
    }
  };

  _setWithdrawVestingRoute = async (from, to, percentage, autoVest) => {
    const { mutations } = this.props;

    try {
      await mutations.setWithdrawVestingRoute.mutateAsync({
        toAccount: to,
        percent: percentage,
        autoVest,
      });
    } catch (error) {
      alert(error.message || error.toString());
    }
  };

  _handleOnModalClose = () => {
    const { navigation } = this.props;
    this._delayedRefreshCoinsData();
    navigation.goBack();
  };

  render() {
    const {
      accounts,
      children,
      hivePerMVests,
      currentAccount,
      actionModalVisible,
      dispatch,
      route,
    } = this.props;
    const {
      balance,
      fundType,
      selectedAccount,
      tokenAddress,
      referredUsername,
      spkMarkets,
      initialAmount,
      initialMemo,
      recurrentTransfers,
    } = this.state;

    const transferType = route.params?.transferType ?? '';
    const tokenLayer = route.params?.assetLayer ?? '';

    return (
      children &&
      children({
        dispatch,
        accounts,
        balance,
        tokenAddress,
        fundType,
        transferType,
        selectedAccount,
        hivePerMVests,
        actionModalVisible,
        referredUsername,
        spkMarkets,
        fetchBalance: this.fetchBalance,
        getAccountsWithUsername: this._getAccountsWithUsername,
        transferToAccount: this._transferToAccount,
        handleOnModalClose: this._handleOnModalClose,
        accountType: get(selectedAccount || currentAccount, 'local.authType'),
        currentAccountName: get(currentAccount, 'name'),
        setWithdrawVestingRoute: this._setWithdrawVestingRoute,
        initialAmount,
        initialMemo,
        fetchRecurrentTransfers: this._fetchRecurrentTransfers,
        recurrentTransfers,
        tokenLayer,
      })
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: selectOtherAccounts(state),
  currentAccount: selectCurrentAccount(state),
  hivePerMVests: selectGlobalProps(state).hivePerMVests,
  actionModalVisible: state.ui.actionModalVisible,
});

const mapHooksToProps = (props) => {
  const navigation = useNavigation();
  const mutations = useTransferMutations();
  return React.createElement(TransferContainer, {
    ...props,
    navigation,
    mutations,
  });
};

export default connect(mapStateToProps)(injectIntl(mapHooksToProps));
