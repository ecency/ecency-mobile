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

    if (this.state.transferType === TransferTypes.POWER_GRANT_SPK) {
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

      const assetLayer = this.props.route.params?.assetLayer ?? this.props.route.params?.tokenLayer;
      if (assetLayer === TokenLayers.ENGINE) {
        const tokenBalances = await fetchTokenBalances(username);

        tokenBalances.forEach((tokenBalance) => {
          if (tokenBalance.symbol === fundType) {
            switch (transferType) {
              case TransferTypes.UNDELEGATE:
                balance = tokenBalance.delegationsOut;
                break;
              case TransferTypes.UNSTAKE:
              case TransferTypes.DELEGATE:
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

    // SDK mutations already invalidate portfolio on success via the adapter.
    // Wait 3 seconds for blockchain propagation, then invalidate secondary data
    // that the SDK doesn't cover (activities, pending requests, etc.)
    setTimeout(() => {
      // Re-invalidate portfolio as safety net for blockchain propagation
      queryClient.invalidateQueries({
        queryKey: ['wallet', 'portfolio', 'v2', currentAccount.name],
      });

      // Invalidate secondary data (lazy refetch on next view)
      queryClient.invalidateQueries({
        queryKey: [QUERIES.WALLET.GET_ACTIVITIES, currentAccount.name],
      });
      queryClient.invalidateQueries({
        queryKey: ['accounts', 'transactions', currentAccount.name],
      });
      queryClient.invalidateQueries({
        queryKey: ['points', currentAccount.name],
      });
      queryClient.invalidateQueries({
        queryKey: ['wallet', 'savings-withdraw'],
      });
      queryClient.invalidateQueries({
        queryKey: ['wallet', 'conversion-requests'],
      });
      queryClient.invalidateQueries({
        queryKey: ['wallet', 'open-orders'],
      });
      queryClient.invalidateQueries({
        queryKey: ['wallet', 'recurrent-transfers'],
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
    const tokenLayer = route.params?.assetLayer ?? route.params?.tokenLayer ?? '';

    const data: any = { from, destination, amount, memo, fundType };

    if (recurrence !== undefined && recurrence !== null) {
      data.recurrence = +recurrence;
    }
    if (executions !== undefined && executions !== null) {
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

      let alertId = 'alert.fail';
      const msg = error?.message?.toLowerCase?.() || '';
      if (msg.includes('key') || msg.includes('authority') || msg.includes('missing')) {
        alertId = 'alert.key_warning';
      }

      dispatch(toastNotification(intl.formatMessage({ id: alertId })));
    };

    try {
      // Handle ENGINE layer
      if (tokenLayer === TokenLayers.ENGINE) {
        const amountStr = data.amount.split(' ')[0];
        switch (transferType) {
          case TransferTypes.TRANSFER:
            await mutations.transferEngine.mutateAsync({
              to: data.destination,
              symbol: fundType,
              quantity: amountStr,
              memo: data.memo,
            });
            break;
          case TransferTypes.STAKE:
            await mutations.stakeEngine.mutateAsync({
              to: data.destination || from,
              symbol: fundType,
              quantity: amountStr,
            });
            break;
          case TransferTypes.DELEGATE:
            await mutations.delegateEngine.mutateAsync({
              to: data.destination,
              symbol: fundType,
              quantity: amountStr,
            });
            break;
          case TransferTypes.UNSTAKE:
            await mutations.unstakeEngine.mutateAsync({
              to: data.destination || from,
              symbol: fundType,
              quantity: amountStr,
            });
            break;
          case TransferTypes.UNDELEGATE:
            await mutations.undelegateEngine.mutateAsync({
              from: data.destination,
              symbol: fundType,
              quantity: amountStr,
            });
            break;
          default:
            throw new Error(`Unknown transferType for ENGINE: ${transferType}`);
        }
        _onSuccess();
        return;
      }

      // Handle SPK layer
      if (tokenLayer === TokenLayers.SPK) {
        const spkAmount = parseFloat(data.amount);
        if (Number.isNaN(spkAmount)) {
          throw new Error(`Invalid SPK amount: ${data.amount}`);
        }
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
          default:
            throw new Error(`Unknown transferType for SPK: ${transferType}`);
        }
        _onSuccess();
        return;
      }

      // Handle HIVE layer
      if (tokenLayer === TokenLayers.HIVE) {
        switch (transferType) {
          case TransferTypes.TRANSFER: {
            const destinations = data.destination
              .trim()
              .split(/[\s,]+/)
              .filter(Boolean);
            if (destinations.length === 0) {
              throw new Error('No valid transfer destinations provided');
            }
            const results = await Promise.allSettled(
              destinations.map((dest) =>
                mutations.transfer.mutateAsync({
                  to: dest,
                  amount: data.amount,
                  memo: data.memo,
                }),
              ),
            );
            const failures = results.filter(
              (r): r is PromiseRejectedResult => r.status === 'rejected',
            );
            const successes = destinations.length - failures.length;

            if (failures.length === destinations.length) {
              // All transfers failed – surface as an error
              const msgs = failures.map((f) => f.reason?.message || 'Unknown error').join('; ');
              throw new Error(
                `${failures.length}/${destinations.length} transfers failed: ${msgs}`,
              );
            }

            if (failures.length > 0 && successes > 0) {
              // Partial success: refresh balances but notify user of partial failure
              this._delayedRefreshCoinsData();
              dispatch(
                toastNotification(
                  `${successes}/${destinations.length} transfers succeeded, ${failures.length} failed`,
                ),
              );
              navigation.goBack();
              return;
            }
            break;
          }
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
          case TransferTypes.WITHDRAW_VESTING: {
            const vestsAmount = Number(amount);
            if (Number.isNaN(vestsAmount)) {
              throw new Error(`Invalid amount for WITHDRAW_VESTING: ${amount}`);
            }
            await mutations.withdrawVesting.mutateAsync({
              vestingShares: `${vestsAmount.toFixed(6)} VESTS`,
            });
            break;
          }
          case TransferTypes.DELEGATE_VESTING_SHARES: {
            const vestsAmount = Number(amount);
            if (Number.isNaN(vestsAmount)) {
              throw new Error(`Invalid amount for DELEGATE_VESTING_SHARES: ${amount}`);
            }
            await mutations.delegateVestingShares.mutateAsync({
              delegatee: data.destination,
              vestingShares: `${vestsAmount.toFixed(6)} VESTS`,
            });
            break;
          }
          default:
            throw new Error(`Unknown transferType for HIVE: ${transferType}`);
        }
        _onSuccess();
        return;
      }

      // Handle POINTS layer
      if (tokenLayer === TokenLayers.POINTS) {
        const destinations = data.destination
          .trim()
          .split(/[\s,]+/)
          .filter(Boolean);
        if (destinations.length === 0) {
          throw new Error('No valid transfer destinations provided');
        }
        const results = await Promise.allSettled(
          destinations.map((dest) =>
            mutations.transferPoint.mutateAsync({
              to: dest,
              amount: data.amount,
              memo: data.memo,
            }),
          ),
        );
        const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
        const successes = destinations.length - failures.length;

        if (failures.length === destinations.length) {
          // All transfers failed – surface as an error
          const msgs = failures.map((f) => f.reason?.message || 'Unknown error').join('; ');
          throw new Error(`${failures.length}/${destinations.length} transfers failed: ${msgs}`);
        }

        if (failures.length > 0 && successes > 0) {
          // Partial success: refresh balances but notify user of partial failure
          this._delayedRefreshCoinsData();
          dispatch(
            toastNotification(
              `${successes}/${destinations.length} transfers succeeded, ${failures.length} failed`,
            ),
          );
          navigation.goBack();
          return;
        }

        _onSuccess();
        return;
      }

      throw new Error(`Unknown tokenLayer: ${tokenLayer}`);
    } catch (error) {
      _onError(error);
    }
  };

  _setWithdrawVestingRoute = async (_from, to, percentage, autoVest) => {
    const { mutations, dispatch, intl } = this.props;

    try {
      await mutations.setWithdrawVestingRoute.mutateAsync({
        toAccount: to,
        percent: percentage,
        autoVest,
      });
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
      this._delayedRefreshCoinsData();
    } catch (error) {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      throw error;
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
    const tokenLayer = route.params?.assetLayer ?? route.params?.tokenLayer ?? '';

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
