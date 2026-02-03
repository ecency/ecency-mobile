import get from 'lodash/get';
import {
  getQueryClient,
  getAccountsQueryOptions,
  getConversionRequestsQueryOptions,
  getDynamicPropsQueryOptions,
  getOpenOrdersQueryOptions,
  getSavingsWithdrawFromQueryOptions,
  getCurrencyTokenRate,
} from '@ecency/sdk';
import parseDate from './parseDate';
import parseToken from './parseToken';
import { vestsToHp } from './conversions';
import { CoinActivity } from '../redux/reducers/walletReducer';

import { EngineOperations, HistoryItem } from '../providers/hive-engine/hiveEngine.types';
import { RepeatableTransfers } from '../constants/repeatableTransfers';

export const transferTypes = [
  'curation_reward',
  'author_reward',
  'comment_benefactor_reward',
  'claim_reward_balance',
  'transfer',
  'transfer_to_savings',
  'transfer_from_savings',
  'transfer_to_vesting',
  'withdraw_vesting',
  'fill_order',
  'escrow_transfer',
  'escrow_dispute',
  'escrow_release',
  'escrow_approve',
  'delegate_vesting_shares',
  'cancel_transfer_from_savings',
  'fill_convert_request',
  'fill_transfer_from_savings',
  'fill_vesting_withdraw',
];

export const groomingTransactionData = (transaction, hivePerMVests): CoinActivity | null => {
  if (!transaction) {
    return null;
  }

  const vestsToHpRate = hivePerMVests || 0;
  const isLegacy = Array.isArray(transaction);
  const opType = isLegacy ? transaction[1]?.op?.[0] : transaction.type;
  const opData = isLegacy ? transaction[1]?.op?.[1] : transaction;
  const timestamp = isLegacy ? transaction[1]?.timestamp : transaction.timestamp;
  const trxIndex = isLegacy ? transaction[0] : transaction.num;

  const result: CoinActivity = {
    iconType: 'MaterialIcons',
    trxIndex,
  };

  result.textKey = opType;

  result.created = timestamp;
  result.icon = 'local-activity';

  // Format other wallet related operations
  result.repeatable = RepeatableTransfers[result.textKey] || false;

  switch (result.textKey) {
    case 'curation_reward':
      const { reward } = opData;
      const { comment_author: commentAuthor, comment_permlink: commentPermlink } = opData;

      result.value = `${vestsToHp(parseToken(reward), vestsToHpRate)
        .toFixed(3)
        .replace(',', '.')} HP`;
      result.details = commentAuthor ? `@${commentAuthor}/${commentPermlink}` : null;
      break;
    case 'author_reward':
    case 'comment_benefactor_reward':
      let {
        hbd_payout: hbdPayout,
        hive_payout: hivePayout,
        vesting_payout: vestingPayout,
      } = opData;

      const { author, permlink } = opData;

      hbdPayout = parseToken(hbdPayout).toFixed(3).replace(',', '.');
      hivePayout = parseToken(hivePayout).toFixed(3).replace(',', '.');
      vestingPayout = vestsToHp(parseToken(vestingPayout), vestsToHpRate)
        .toFixed(3)
        .replace(',', '.');

      result.value = `${hbdPayout > 0 ? `${hbdPayout} HBD` : ''} ${
        hivePayout > 0 ? `${hivePayout} HIVE` : ''
      } ${vestingPayout > 0 ? `${vestingPayout} HP` : ''}`;

      result.details = author && permlink ? `@${author}/${permlink}` : null;
      if (result.textKey === 'comment_benefactor_reward') {
        result.icon = 'comment';
      }
      break;
    case 'claim_reward_balance':
      let { reward_hbd: rewardHdb, reward_hive: rewardHive, reward_vests: rewardVests } = opData;

      rewardHdb = parseToken(rewardHdb).toFixed(3).replace(',', '.');
      rewardHive = parseToken(rewardHive).toFixed(3).replace(',', '.');
      rewardVests = vestsToHp(parseToken(rewardVests), vestsToHpRate).toFixed(3).replace(',', '.');

      result.value = `${rewardHdb > 0 ? `${rewardHdb} HBD` : ''} ${
        rewardHive > 0 ? `${rewardHive} HIVE` : ''
      } ${rewardVests > 0 ? `${rewardVests} HP` : ''}`;
      break;
    case 'transfer':
    case 'transfer_to_savings':
    case 'transfer_from_savings':
    case 'transfer_to_vesting':
      const { amount, memo, from, to } = opData;

      result.value = `${amount}`;
      result.icon = 'compare-arrows';
      result.details = from && to ? `@${from} to @${to}` : null;
      result.sender = from;
      result.receiver = to;
      result.memo = memo || null;
      break;
    case 'withdraw_vesting':
      const { acc } = opData;
      let { vesting_shares: opVestingShares } = opData;

      opVestingShares = parseToken(opVestingShares);
      result.value = `${vestsToHp(opVestingShares, hivePerMVests).toFixed(3).replace(',', '.')} HP`;
      result.icon = 'attach-money';
      result.details = acc ? `@${acc}` : null;
      break;
    case 'fill_order':
      const { current_pays: currentPays, open_pays: openPays } = opData;

      result.value = `${currentPays} = ${openPays}`;
      result.icon = 'reorder';
      break;
    case 'escrow_transfer':
    case 'escrow_dispute':
    case 'escrow_release':
    case 'escrow_approve':
      const { agent, escrow_id } = opData;
      const { from: frome } = opData;
      const { to: toe } = opData;

      result.value = `${escrow_id}`;
      result.icon = 'wb-iridescent';
      result.details = frome && toe ? `@${frome} to @${toe}` : null;
      result.memo = agent || null;
      break;
    case 'delegate_vesting_shares':
      const { delegator, delegatee, vesting_shares } = opData;

      result.value = `${vesting_shares}`;
      result.icon = 'change-history';
      result.details = delegatee && delegator ? `@${delegator} to @${delegatee}` : null;
      break;
    case 'cancel_transfer_from_savings':
      const { from: from_who, request_id: requestId } = opData;

      result.value = `${0}`;
      result.icon = 'cancel';
      result.details = from_who ? `from @${from_who}, id: ${requestId}` : null;
      break;
    case 'fill_convert_request':
      const { owner: who, requestid: requestedId, amount_out } = opData;

      result.value = `${amount_out}`;
      result.icon = 'hourglass-full';
      result.details = who ? `@${who}, id: ${requestedId}` : null;
      break;
    case 'fill_transfer_from_savings':
      const { from: fillwho, to: fillto, amount: fillamount, request_id: fillrequestId } = opData;

      result.value = `${fillamount}`;
      result.icon = 'hourglass-full';
      result.details = fillwho ? `@${fillwho} to @${fillto}, id: ${fillrequestId}` : null;
      break;
    case 'fill_vesting_withdraw':
      const { from_account: pd_who, to_account: pd_to, deposited } = opData;

      result.value = `${deposited}`;
      result.icon = 'hourglass-full';
      result.details = pd_who ? `@${pd_who} to ${pd_to}` : null;
      break;
    default:
      return null;
  }
  return result;
};

export const groomingEngineHistory = (transaction: HistoryItem): CoinActivity | null => {
  const { blockNumber, operation, timestamp, symbol, quantity, authorperm, memo, from, to } =
    transaction;

  const result: CoinActivity = {
    iconType: 'MaterialIcons',
    trxIndex: blockNumber,
    engineTrxId: transaction?.id || transaction?._id,
    textKey: operation,
    created: new Date(timestamp).toISOString(),
    value: `${quantity} ${symbol}`,
    memo: memo || '',
    details: authorperm || (from && to ? `@${from} to @${to}` : null),
    sender: from,
    receiver: to,
    icon: 'local-activity',
    expires: '',
    repeatable: RepeatableTransfers[operation] || false,
  };

  switch (result.textKey) {
    case EngineOperations.TOKENS_CREATE:
      result.icon = 'fiber-new';
      break;

    case EngineOperations.TOKENS_TRANSFER:
    case EngineOperations.TOKENS_TRANSFER_OWNERSHIP:
    case EngineOperations.TOKENS_TRANSFER_TO_CONTRACT:
      result.icon = 'compare-arrows';
      break;

    case EngineOperations.TOKENS_TRANSFER_FROM_CONTRACT:
    case EngineOperations.TOKENS_TRANSFER_FEE:
      result.icon = 'attach-money';
      break;

    case EngineOperations.TOKENS_UPDATE_PRECISION:
    case EngineOperations.TOKENS_UPDATE_URL:
    case EngineOperations.TOKENS_UPDATE_METADATA:
      result.icon = 'reorder';
      break;

    case EngineOperations.TOKENS_ENABLE_STAKING:
    case EngineOperations.TOKENS_ENABLE_DELEGATION:
    case EngineOperations.TOKENS_ISSUE:
      result.icon = 'wb-iridescent';
      break;

    case EngineOperations.TOKENS_DELEGATE:
    case EngineOperations.TOKENS_STAKE:
      result.icon = 'change-history';
      break;

    // Group 7

    case EngineOperations.TOKENS_CANCEL_UNSTAKE:
      result.icon = 'cancel';
      break;

    // Group 8
    case EngineOperations.TOKENS_UNDELEGATE_DONE:
    case EngineOperations.TOKENS_UNSTAKE_DONE:
      result.icon = 'hourglass-full';
      break;
    case EngineOperations.TOKENS_UNDELEGATE_START:
    case EngineOperations.TOKENS_UNSTAKE_START:
      result.icon = 'hourglass-top';
      break;
  }

  return result;
};

export const groomingWalletTabData = async ({
  user,
  globalProps,
  quotes,
  userCurrency: _userCurrency,
  isRefresh,
}) => {
  const walletData = {};

  if (!user) {
    return walletData;
  }

  // TODO: use passed account data if not refreshing
  const queryClient = getQueryClient();
  let userdata = user;
  if (isRefresh) {
    const accounts = await queryClient.fetchQuery(getAccountsQueryOptions([get(user, 'name')]));
    if (!accounts || accounts.length === 0) {
      console.warn(
        'groomingWalletTabData: fetchQuery returned empty array for user',
        get(user, 'name'),
      );
      // Fall back to passed user data instead of undefined
      userdata = user;
    } else {
      [userdata] = accounts;
    }
  }

  // const { accounts } = state;
  // if (!accounts) {
  //  return walletData;
  // }

  walletData.rewardHiveBalance = parseToken(userdata.reward_hive_balance);
  walletData.rewardHbdBalance = parseToken(userdata.reward_hbd_balance);
  walletData.rewardVestingHive = parseToken(userdata.reward_vesting_hive);
  walletData.hasUnclaimedRewards =
    walletData.rewardHiveBalance > 0 ||
    walletData.rewardHbdBalance > 0 ||
    walletData.rewardVestingHive > 0;
  walletData.balance = parseToken(userdata.balance);
  walletData.vestingShares = parseToken(userdata.vesting_shares);
  walletData.vestingSharesDelegated = parseToken(userdata.delegated_vesting_shares);
  walletData.vestingSharesReceived = parseToken(userdata.received_vesting_shares);
  walletData.vestingSharesTotal =
    walletData.vestingShares - walletData.vestingSharesDelegated + walletData.vestingSharesReceived;
  walletData.hbdBalance = parseToken(userdata.hbd_balance);
  walletData.savingBalance = parseToken(userdata.savings_balance);
  walletData.savingBalanceHbd = parseToken(userdata.savings_hbd_balance);

  const shouldFetchFeedHistory = isRefresh || !globalProps?.base || !globalProps?.quote;
  // use base and quote from account.globalProps redux
  const dynamicProps = shouldFetchFeedHistory
    ? await queryClient.fetchQuery(getDynamicPropsQueryOptions())
    : {
        base: globalProps.base,
        quote: globalProps.quote,
      };
  const base = parseToken(dynamicProps.base);
  const quote = parseToken(dynamicProps.quote);

  walletData.hivePerMVests = globalProps.hivePerMVests;

  const pricePerHive = base / quote;

  const totalHive =
    vestsToHp(walletData.vestingShares, walletData.hivePerMVests) +
    walletData.balance +
    walletData.savingBalance;

  const totalHbd = walletData.hbdBalance + walletData.savingBalanceHbd;

  walletData.estimatedValue = totalHive * pricePerHive + totalHbd;

  const hasQuotes = quotes?.hive_dollar?.price != null && quotes?.hive?.price != null;
  // If cached quotes are missing, fall back to on-chain median price (HBD ~ 1, HIVE = pricePerHive).
  const ppHbd = hasQuotes ? quotes.hive_dollar.price : 1;
  const ppHive = hasQuotes ? quotes.hive.price : pricePerHive;

  walletData.estimatedHiveValue = (walletData.balance + walletData.savingBalance) * ppHive;
  walletData.estimatedHbdValue = totalHbd * ppHbd;
  walletData.estimatedHpValue =
    vestsToHp(walletData.vestingShares, walletData.hivePerMVests) * ppHive;

  walletData.showPowerDown = userdata.next_vesting_withdrawal !== '1969-12-31T23:59:59';
  const timeDiff = Math.abs(parseDate(userdata.next_vesting_withdrawal) - new Date());
  walletData.nextVestingWithdrawal = Math.round(timeDiff / (1000 * 3600));

  return walletData;
};

export const fetchPendingRequests = async (
  username: string,
  coinSymbol: string,
): Promise<CoinActivity[]> => {
  const queryClient = getQueryClient();
  const _rawConversions = await queryClient.fetchQuery(getConversionRequestsQueryOptions(username));
  const _rawOpenOrdres = await queryClient.fetchQuery(getOpenOrdersQueryOptions(username));
  const _rawWithdrawRequests = await queryClient.fetchQuery(
    getSavingsWithdrawFromQueryOptions(username),
  );

  console.log('fetched pending requests', _rawConversions, _rawOpenOrdres, _rawWithdrawRequests);

  const openOrderRequests = _rawOpenOrdres
    .filter((request) => request.sell_price.base.includes(coinSymbol))
    .map((request) => {
      const { base, quote } = request?.sell_price || {};
      const { orderid } = request;
      return {
        trxIndex: orderid,
        iconType: 'MaterialIcons',
        textKey: 'open_order',
        expires: request.expiration,
        created: request.created,
        icon: 'reorder',
        value: base || '-- --',
        details: base && quote ? `@ ${base} = ${quote}` : '',
        cancelable: true,
      } as CoinActivity;
    });

  const withdrawRequests = _rawWithdrawRequests
    .filter((request) => request.amount.includes(coinSymbol))
    .map((request) => {
      return {
        iconType: 'MaterialIcons',
        textKey: 'withdraw_savings',
        created: request.complete,
        icon: 'compare-arrows',
        value: request.amount,
        details: request.from && request.to ? `@${request.from} to @${request.to}` : null,
        memo: request.memo || null,
      } as CoinActivity;
    });

  const conversionRequests = _rawConversions
    .filter((request) => request.amount.includes(coinSymbol))
    .map((request) => {
      return {
        iconType: 'MaterialIcons',
        textKey: 'convert_request',
        created: request.conversion_date,
        icon: 'hourglass-full',
        value: request.amount,
      } as CoinActivity;
    });

  const pendingRequests = [...openOrderRequests, ...withdrawRequests, ...conversionRequests];

  pendingRequests.sort((a, b) =>
    new Date(a.expires || a.created).getTime() > new Date(b.expires || b.created).getTime()
      ? 1
      : -1,
  );

  return pendingRequests;
};

/**
 *
 * @param username
 * @param assetSymbol
 * @param globalProps
 * @returns {Promise<CoinActivity[]>}
 */

export const groomingPointsTransactionData = (transaction) => {
  if (!transaction) {
    return null;
  }
  const result = {
    ...transaction,
  } as CoinActivity;

  result.details = transaction.sender
    ? `from @${transaction.sender}`
    : transaction.receiver && `to @${transaction.receiver}`;

  result.value = `${transaction.amount} Points`;
  result.trxIndex = transaction.id;
  result.repeatable = RepeatableTransfers[transaction.textKey] || false;
  result.sender = transaction.sender;
  result.receiver = transaction.receiver;

  return result;
};

export const getPointsEstimate = async (amount, userCurrency) => {
  if (!amount) {
    return 0;
  }
  const ppEstm = await getCurrencyTokenRate(userCurrency, 'estm');

  return ppEstm * amount;
};

export const getBtcEstimate = async (amount, userCurrency) => {
  if (!amount) {
    return 0;
  }
  const ppBtc = await getCurrencyTokenRate(userCurrency, 'btc');

  return ppBtc * amount;
};
