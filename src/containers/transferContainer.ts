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
import {
  selectCurrentAccount,
  selectGlobalProps,
  selectPin,
  selectOtherAccounts,
} from '../redux/selectors';

import {
  transferToken,
  convert,
  transferFromSavings,
  transferToSavings,
  transferToVesting,
  transferPoint,
  withdrawVesting,
  delegateVestingShares,
  setWithdrawVestingRoute,
  recurrentTransferToken,
  buildTransferTokenOpArr,
  buildRecurrentTransferOpArr,
  buildConvertOpArr,
  buildTransferToSavingsOpArr,
  buildTransferFromSavingsOpArr,
  buildTransferToVestingOpArr,
  buildWithdrawVestingOpArr,
  buildDelegateVestingSharesOpArr,
  buildSetWithdrawVestingRouteOpArr,
  buildTransferPointOpArr,
} from '../providers/hive/dhive';
import { useActiveKeyOperation } from '../hooks';
import { getQueryClient } from '../providers/queries';
import QUERIES from '../providers/queries/queryKeys';
import { toastNotification } from '../redux/actions/uiAction';
import { getUserDataWithUsername } from '../realm/realm';
import { getPointsSummary } from '../providers/ecency/ePoint';

// Utils
import { countDecimals } from '../utils/number';
import {
  delegateHiveEngine,
  stakeHiveEngine,
  transferHiveEngine,
  undelegateHiveEngine,
  unstakeHiveEngine,
  getEngineActionOpArray,
} from '../providers/hive-engine/hiveEngineActions';
import { fetchTokenBalances } from '../providers/hive-engine/hiveEngine';
import { EngineActions } from '../providers/hive-engine/hiveEngine.types';
import TransferTypes from '../constants/transferTypes';
import {
  delegateLarynx,
  powerLarynx,
  transferLarynx,
  transferSpk,
  fetchSpkMarkets,
  getSpkTransferOpArr,
  getSpkDelegateOpArr,
  getSpkPowerOpArr,
} from '../providers/hive-spk/hiveSpk';
import { SpkPowerMode } from '../providers/hive-spk/hiveSpk.types';
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
    const { pinCode, navigation, dispatch, intl, route, executeOperation } = this.props;
    let { currentAccount } = this.props;
    const { selectedAccount } = this.state;

    const transferType = route.params?.transferType ?? '';
    const fundType = route.params?.fundType ?? '';
    const tokenLayer = route.params?.assetLayer ?? '';

    let func;
    let operations;

    const data = {
      from,
      destination,
      amount,
      memo,
      fundType,
    };

    if (recurrence && executions) {
      data.recurrence = +recurrence;
      data.executions = +executions;
    }

    if (countDecimals(Number(data.amount)) < 3) {
      data.amount = Number(data.amount).toFixed(3);
    }

    data.amount = `${data.amount} ${fundType}`;

    // Ensure currentAccount has local data
    if (!currentAccount.local) {
      const realmData = await getUserDataWithUsername(currentAccount.name);
      [currentAccount.local] = realmData;
    }

    // Handle ENGINE layer transfers with unified approach
    if (tokenLayer === TokenLayers.ENGINE) {
      let engineAction;
      switch (transferType) {
        case TransferTypes.TRANSFER:
          engineAction = EngineActions.TRANSFER;
          func = () => transferHiveEngine(currentAccount, pinCode, data);
          break;
        case TransferTypes.STAKE:
          engineAction = EngineActions.STAKE;
          func = () => stakeHiveEngine(currentAccount, pinCode, data);
          break;
        case TransferTypes.DELEGATE:
          engineAction = EngineActions.DELEGATE;
          func = () => delegateHiveEngine(currentAccount, pinCode, data);
          break;
        case TransferTypes.UNSTAKE:
          engineAction = EngineActions.UNSTAKE;
          func = () => unstakeHiveEngine(currentAccount, pinCode, data);
          break;
        case TransferTypes.UNDELEGATE:
          engineAction = EngineActions.UNDELEGATE;
          func = () => undelegateHiveEngine(currentAccount, pinCode, data);
          break;
      }

      // Build operations for ENGINE tokens
      operations = getEngineActionOpArray(
        engineAction,
        currentAccount.name,
        data.destination,
        data.amount,
        fundType,
        data.memo,
      );

      try {
        await executeOperation({
          operations,
          privateKeyHandler: func,
          callbacks: {
            onSuccess: () => {
              dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
              this._delayedRefreshCoinsData();
              navigation.goBack();
            },
            onError: (error) => {
              navigation.goBack();
              Sentry.captureException(error);
              dispatch(toastNotification(intl.formatMessage({ id: 'alert.key_warning' })));
            },
            onClose: () => {
              navigation.goBack();
            },
          },
        });
      } catch (error) {
        // Error already handled in callbacks
      }
      return;
    }

    // Handle SPK layer transfers with unified approach
    if (tokenLayer === TokenLayers.SPK) {
      switch (transferType) {
        case TransferTypes.TRANSFER_SPK:
          operations = getSpkTransferOpArr(
            currentAccount.name,
            data.destination,
            data.amount,
            data.memo,
            false, // isLarynx = false for SPK
          );
          func = () => transferSpk(currentAccount, pinCode, data);
          break;
        case TransferTypes.TRANSFER_LARYNX:
          operations = getSpkTransferOpArr(
            currentAccount.name,
            data.destination,
            data.amount,
            data.memo,
            true, // isLarynx = true for LARYNX
          );
          func = () => transferLarynx(currentAccount, pinCode, data);
          break;
        case TransferTypes.POWER_UP_SPK:
          data.mode = SpkPowerMode.UP;
          operations = getSpkPowerOpArr(currentAccount.name, data.amount, SpkPowerMode.UP);
          func = () => powerLarynx(currentAccount, pinCode, data);
          break;
        case TransferTypes.POWER_DOWN_SPK:
          data.mode = SpkPowerMode.DOWN;
          operations = getSpkPowerOpArr(currentAccount.name, data.amount, SpkPowerMode.DOWN);
          func = () => powerLarynx(currentAccount, pinCode, data);
          break;
        case TransferTypes.POWER_GRANT_SPK:
          operations = getSpkDelegateOpArr(currentAccount.name, data.destination, data.amount);
          func = () => delegateLarynx(currentAccount, pinCode, data);
          break;
      }

      try {
        await executeOperation({
          operations,
          privateKeyHandler: func,
          callbacks: {
            onSuccess: () => {
              dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
              this._delayedRefreshCoinsData();
              navigation.goBack();
            },
            onError: (error) => {
              navigation.goBack();
              Sentry.captureException(error);
              dispatch(toastNotification(intl.formatMessage({ id: 'alert.key_warning' })));
            },
            onClose: () => {
              navigation.goBack();
            },
          },
        });
      } catch (error) {
        // Error already handled in callbacks
      }
      return;
    }

    // Handle HIVE layer transfers with unified active key operation approach
    if (tokenLayer === TokenLayers.HIVE) {
      switch (transferType) {
        case TransferTypes.TRANSFER:
          operations = buildTransferTokenOpArr(data.from, data.destination, data.amount, data.memo);
          func = () => transferToken(currentAccount, pinCode, data);
          break;
        case TransferTypes.RECURRENT_TRANSFER:
          operations = buildRecurrentTransferOpArr(
            data.from,
            data.destination,
            data.amount,
            data.memo,
            data.recurrence,
            data.executions,
          );
          func = () => recurrentTransferToken(currentAccount, pinCode, data);
          break;
        case TransferTypes.CONVERT:
          data.requestId = new Date().getTime() >>> 0;
          operations = buildConvertOpArr(data.from, data.amount, data.requestId);
          func = () => convert(currentAccount, pinCode, data);
          break;
        case TransferTypes.TRANSFER_TO_SAVINGS:
          operations = buildTransferToSavingsOpArr(
            data.from,
            data.destination,
            data.amount,
            data.memo,
          );
          func = () => transferToSavings(currentAccount, pinCode, data);
          break;
        case TransferTypes.TRANSFER_FROM_SAVINGS:
          data.requestId = new Date().getTime() >>> 0;
          operations = buildTransferFromSavingsOpArr(
            data.from,
            data.destination,
            data.amount,
            data.memo,
            data.requestId,
          );
          func = () => transferFromSavings(currentAccount, pinCode, data);
          break;
        case TransferTypes.TRANSFER_TO_VESTING:
          operations = buildTransferToVestingOpArr(data.from, data.destination, data.amount);
          func = () => transferToVesting(currentAccount, pinCode, data);
          break;
        case TransferTypes.WITHDRAW_VESTING:
          currentAccount = selectedAccount;
          data.amount = `${amount.toFixed(6)} VESTS`;
          operations = buildWithdrawVestingOpArr(data.from, data.amount);
          func = () => withdrawVesting(currentAccount, pinCode, data);
          break;
        case TransferTypes.DELEGATE_VESTING_SHARES:
          currentAccount = selectedAccount;
          data.amount = `${amount.toFixed(6)} VESTS`;
          operations = buildDelegateVestingSharesOpArr(data.from, data.destination, data.amount);
          func = () => delegateVestingShares(currentAccount, pinCode, data);
          break;
      }

      try {
        await executeOperation({
          operations,
          privateKeyHandler: func,
          callbacks: {
            onSuccess: () => {
              dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
              this._delayedRefreshCoinsData();
              navigation.goBack();
            },
            onError: (error) => {
              navigation.goBack();
              Sentry.captureException(error);
              dispatch(toastNotification(intl.formatMessage({ id: 'alert.key_warning' })));
            },
            onClose: () => {
              navigation.goBack();
            },
          },
        });
      } catch (error) {
        // Error already handled in callbacks
      }
      return;
    }

    // Handle POINTS layer with unified approach
    if (tokenLayer === TokenLayers.POINTS) {
      operations = buildTransferPointOpArr(data.from, data.destination, data.amount, data.memo);
      func = () => transferPoint(currentAccount, pinCode, data);

      try {
        await executeOperation({
          operations,
          privateKeyHandler: func,
          callbacks: {
            onSuccess: () => {
              dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
              this._delayedRefreshCoinsData();
              navigation.goBack();
            },
            onError: (error) => {
              navigation.goBack();
              Sentry.captureException(error);
              dispatch(toastNotification(intl.formatMessage({ id: 'alert.key_warning' })));
            },
            onClose: () => {
              navigation.goBack();
            },
          },
        });
      } catch (error) {
        // Error already handled in callbacks
      }
    }
  };

  _setWithdrawVestingRoute = async (from, to, percentage, autoVest) => {
    const { currentAccount, pinCode, executeOperation } = this.props;

    const data = {
      from,
      to,
      percentage,
      autoVest,
    };

    const operations = buildSetWithdrawVestingRouteOpArr(from, to, percentage, autoVest);

    try {
      await executeOperation({
        operations,
        privateKeyHandler: () => setWithdrawVestingRoute(currentAccount, pinCode, data),
        callbacks: {
          onSuccess: () => {
            // Success - no toast needed for this operation
          },
          onError: (error) => {
            alert(error.message || error.toString());
          },
          onClose: () => {
            // User cancelled
          },
        },
      });
    } catch (err) {
      // Error already handled in callbacks
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
  pinCode: selectPin(state),
  hivePerMVests: selectGlobalProps(state).hivePerMVests,
  actionModalVisible: state.ui.actionModalVisible,
});

const mapHooksToProps = (props) => {
  const navigation = useNavigation();
  const { executeOperation } = useActiveKeyOperation();
  return React.createElement(TransferContainer, {
    ...props,
    navigation,
    executeOperation,
  });
};

export default connect(mapStateToProps)(injectIntl(mapHooksToProps));
