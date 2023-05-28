import get from 'lodash/get';
import isArray from 'lodash/isArray';
import { operationOrders } from '@hiveio/dhive/lib/utils';
import { utils } from '@hiveio/dhive';
import parseDate from './parseDate';
import parseToken from './parseToken';
import { vestsToHp } from './conversions';
import {
  fetchGlobalProps,
  getAccount,
  getAccountHistory,
  getConversionRequests,
  getFeedHistory,
  getOpenOrders,
  getSavingsWithdrawFrom,
} from '../providers/hive/dhive';
import { getCurrencyTokenRate, getLatestQuotes } from '../providers/ecency/ecency';
import {
  CoinActivity,
  CoinBase,
  CoinData,
  DataPair,
  QuoteItem,
} from '../redux/reducers/walletReducer';
import { GlobalProps } from '../redux/reducers/accountReducer';
import { getEstimatedAmount } from './vote';
import { getPointsSummary, getPointsHistory } from '../providers/ecency/ePoint';
// Constant
import POINTS from '../constants/options/points';
import { ASSET_IDS } from '../constants/defaultAssets';

import parseAsset from './parseAsset';
import {
  fetchEngineAccountHistory,
  fetchHiveEngineTokenBalances,
} from '../providers/hive-engine/hiveEngine';
import { EngineActions, EngineOperations, HistoryItem } from '../providers/hive-engine/hiveEngine.types';
import { ClaimsCollection } from '../redux/reducers/cacheReducer';
import { fetchSpkWallet } from '../providers/hive-spk/hiveSpk';
import { SpkActions } from '../providers/hive-spk/hiveSpk.types';
import TransferTypes from '../constants/transferTypes';
import { Alert } from 'react-native';

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

const ECENCY_ACTIONS = ['dropdown_transfer', 'dropdown_promote', 'dropdown_boost'];
const HIVE_ACTIONS = [
  'transfer_token',
  'transfer_to_savings',
  'transfer_to_vesting',
  'withdraw_hive',
];
const HBD_ACTIONS = ['transfer_token', 'transfer_to_savings', 'convert', 'withdraw_hbd'];
const HIVE_POWER_ACTIONS = ['delegate', 'power_down'];

export const groomingTransactionData = (transaction, hivePerMVests): CoinActivity | null => {
  if (!transaction || !hivePerMVests) {
    return null;
  }

  const result: CoinActivity = {
    iconType: 'MaterialIcons',
    trxIndex: transaction[0],
  };

  [result.textKey] = transaction[1].op;
  const opData = transaction[1].op[1];
  const { timestamp } = transaction[1];

  result.created = timestamp;
  result.icon = 'local-activity';

  //TODO: Format other wallet related operations

  switch (result.textKey) {
    case 'curation_reward':
      const { reward } = opData;
      const { comment_author: commentAuthor, comment_permlink: commentPermlink } = opData;

      result.value = `${vestsToHp(parseToken(reward), hivePerMVests)
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
      vestingPayout = vestsToHp(parseToken(vestingPayout), hivePerMVests)
        .toFixed(3)
        .replace(',', '.');

      result.value = `${hbdPayout > 0 ? `${hbdPayout} HBD` : ''} ${hivePayout > 0 ? `${hivePayout} HIVE` : ''
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
      rewardVests = vestsToHp(parseToken(rewardVests), hivePerMVests).toFixed(3).replace(',', '.');

      result.value = `${rewardHdb > 0 ? `${rewardHdb} HBD` : ''} ${rewardHive > 0 ? `${rewardHive} HIVE` : ''
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
      let { from: frome } = opData;
      let { to: toe } = opData;

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
      let { from: from_who, request_id: requestId } = opData;

      result.value = `${0}`;
      result.icon = 'cancel';
      result.details = from_who ? `from @${from_who}, id: ${requestId}` : null;
      break;
    case 'fill_convert_request':
      let { owner: who, requestid: requestedId, amount_out: amount_out } = opData;

      result.value = `${amount_out}`;
      result.icon = 'hourglass-full';
      result.details = who ? `@${who}, id: ${requestedId}` : null;
      break;
    case 'fill_transfer_from_savings':
      let { from: fillwho, to: fillto, amount: fillamount, request_id: fillrequestId } = opData;

      result.value = `${fillamount}`;
      result.icon = 'hourglass-full';
      result.details = fillwho ? `@${fillwho} to @${fillto}, id: ${fillrequestId}` : null;
      break;
    case 'fill_vesting_withdraw':
      let { from_account: pd_who, to_account: pd_to, deposited: deposited } = opData;

      result.value = `${deposited}`;
      result.icon = 'hourglass-full';
      result.details = pd_who ? `@${pd_who} to ${pd_to}` : null;
      break;
    default:
      return null;
  }
  return result;
};


export const groomingEngineHistory = (transaction:HistoryItem): CoinActivity | null => {

  const {
    blockNumber,
    operation,
    timestamp,
    symbol,
    quantity,
    authorperm,
    memo,
    from,
    to
  } = transaction;

  const result: CoinActivity = {
    iconType: 'MaterialIcons',
    trxIndex: blockNumber,
    textKey: operation,
    created: new Date(timestamp).toISOString(),
    value: `${quantity} ${symbol}`,
    memo : memo || '',
    details :authorperm ? authorperm : from && to ? `@${from} to @${to}` : null,
    icon: 'local-activity',
    expires: ''
  };
  

  switch(result.textKey){

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
      result.icon = 'hourglass-full'
    case EngineOperations.TOKENS_UNDELEGATE_START:
      case EngineOperations.TOKENS_UNSTAKE_START:
      result.icon = 'hourglass-top';
      break;
  }


  return result;
};


export const groomingWalletData = async (user, globalProps, userCurrency) => {
  const walletData = {};

  if (!user) {
    return walletData;
  }

  const userdata = await getAccount(get(user, 'name'));

  //const { accounts } = state;
  //if (!accounts) {
  //  return walletData;
  //}

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

  //TOOD: use base and quote from account.globalProps redux
  const feedHistory = await getFeedHistory();
  const base = parseToken(feedHistory.current_median_history.base);
  const quote = parseToken(feedHistory.current_median_history.quote);

  walletData.hivePerMVests = globalProps.hivePerMVests;

  const pricePerHive = base / quote;

  const totalHive =
    vestsToHp(walletData.vestingShares, walletData.hivePerMVests) +
    walletData.balance +
    walletData.savingBalance;

  const totalHbd = walletData.hbdBalance + walletData.savingBalanceHbd;

  walletData.estimatedValue = totalHive * pricePerHive + totalHbd;

  //TODO: cache data in redux or fetch once on wallet startup
  const ppHbd = await getCurrencyTokenRate(userCurrency, 'hbd');
  const ppHive = await getCurrencyTokenRate(userCurrency, 'hive');

  walletData.estimatedHiveValue = (walletData.balance + walletData.savingBalance) * ppHive;
  walletData.estimatedHbdValue = totalHbd * ppHbd;
  walletData.estimatedHpValue =
    vestsToHp(walletData.vestingShares, walletData.hivePerMVests) * ppHive;

  walletData.showPowerDown = userdata.next_vesting_withdrawal !== '1969-12-31T23:59:59';
  const timeDiff = Math.abs(parseDate(userdata.next_vesting_withdrawal) - new Date());
  walletData.nextVestingWithdrawal = Math.round(timeDiff / (1000 * 3600));

  //TOOD: transfer history can be separated from here
  const op = utils.operationOrders;
  const ops = [
    op.transfer, //HIVE
    op.author_reward, //HBD, HP
    op.curation_reward, //HP
    op.transfer_to_vesting, //HIVE, HP
    op.withdraw_vesting, //HIVE, HP
    op.interest, //HP
    op.transfer_to_savings, //HIVE, HBD
    op.transfer_from_savings, //HIVE, HBD
    op.fill_convert_request, //HBD
    op.fill_order, //HIVE, HBD
    op.claim_reward_balance, //HP
    op.sps_fund, //HBD
    op.comment_benefactor_reward, //HP
    op.return_vesting_delegation, //HP
  ];

  const history = await getAccountHistory(get(user, 'name'), ops);

  const transfers = history.filter((tx) => transferTypes.includes(get(tx[1], 'op[0]', false)));

  transfers.sort(compare);

  walletData.transactions = transfers;
  return walletData;
};

export const fetchPendingRequests = async (
  username: string,
  coinSymbol: string,
): Promise<CoinActivity[]> => {
  const _rawConversions = await getConversionRequests(username);
  const _rawOpenOrdres = await getOpenOrders(username);
  const _rawWithdrawRequests = await getSavingsWithdrawFrom(username);

  console.log('fetched pending requests', _rawConversions, _rawOpenOrdres, _rawWithdrawRequests);

  const openOrderRequests = _rawOpenOrdres
    .filter((request) => request.sell_price.base.includes(coinSymbol))
    .map((request) => {
      const { base, quote } = request?.sell_price || {};
      return {
        iconType: 'MaterialIcons',
        textKey: 'open_order',
        expires: request.expiration,
        created: request.created,
        icon: 'reorder',
        value: base || '-- --',
        details: base && quote ? `@ ${base} = ${quote}` : '',
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
 * @param coinId
 * @param assetSymbol
 * @param globalProps
 * @returns {Promise<CoinActivity[]>}
 */
export const fetchCoinActivities = async ({
  username,
  assetId,
  assetSymbol,
  globalProps,
  startIndex,
  limit,
  isEngine
}: {
  username: string,
  assetId: string,
  assetSymbol: string,
  globalProps: GlobalProps,
  startIndex: number,
  limit: number,
  isEngine?: boolean,
}): Promise<CoinActivity[]> => {
  const op = operationOrders;
  let history = [];

  if (!isEngine) {
    switch (assetId) {
      case ASSET_IDS.ECENCY: {
        //TODO: remove condition when we have a way to fetch paginated points data
        if (startIndex !== -1) {
          return [];
        }

        const pointActivities = await getPointsHistory(username);
        console.log('Points Activities', pointActivities);
        const completed =
          pointActivities && pointActivities.length
            ? pointActivities.map((item) =>
              groomingPointsTransactionData({
                ...item,
                icon: get(POINTS[get(item, 'type')], 'icon'),
                iconType: get(POINTS[get(item, 'type')], 'iconType'),
                textKey: get(POINTS[get(item, 'type')], 'textKey'),
              }),
            )
            : [];
        return completed;
      }
      case ASSET_IDS.HIVE:
        history = await getAccountHistory(
          username,
          [
            op.transfer, //HIVE
            op.transfer_to_vesting, //HIVE, HP
            op.withdraw_vesting, //HIVE, HP
            op.transfer_to_savings, //HIVE, HBD
            op.transfer_from_savings, //HIVE, HBD
            op.fill_order, //HIVE, HBD
          ],
          startIndex,
          limit,
        );
        break;
      case ASSET_IDS.HBD:
        history = await getAccountHistory(
          username,
          [
            op.transfer, //HIVE //HBD
            op.author_reward, //HBD, HP
            op.transfer_to_savings, //HIVE, HBD
            op.transfer_from_savings, //HIVE, HBD
            op.fill_convert_request, //HBD
            op.fill_order, //HIVE, HBD
            op.sps_fund, //HBD
          ],
          startIndex,
          limit,
        );
        break;
      case ASSET_IDS.HP:
        history = await getAccountHistory(
          username,
          [
            op.author_reward, //HBD, HP
            op.curation_reward, //HP
            op.transfer_to_vesting, //HIVE, HP
            op.withdraw_vesting, //HIVE, HP
            op.interest, //HP
            op.claim_reward_balance, //HP
            op.comment_benefactor_reward, //HP
            op.return_vesting_delegation, //HP
          ],
          startIndex,
          limit,
        );
        break;
      default: return [];


    }

    const transfers = history.filter((tx) => transferTypes.includes(get(tx[1], 'op[0]', false)));
    transfers.sort(compare);

    const activities = transfers.map((item) => groomingTransactionData(item, globalProps.hivePerMVests));
    const filterdActivities: CoinActivity[] = activities ? activities.filter((item) => {
      return item && item.value && item.value.includes(assetSymbol);
    }) : []

    console.log('FILTERED comap', activities.length, filterdActivities.length);

    //TODO: process pending requests as separate query //const pendingRequests = await fetchPendingRequests(username, coinSymbol);
    return filterdActivities
  } else {
    //means asset is engine asset, maps response to 

    const engineHistory = await fetchEngineAccountHistory(username, assetSymbol, startIndex, limit);
    const activities = engineHistory.map(groomingEngineHistory);

    return activities;
  }
};


const fetchEngineTokensData = async (username: string, hivePrice: number, vsCurrency: string, claimsCache: ClaimsCollection) => {

  const engineCoinData: { [key: string]: CoinData } = {};

  try {
    const engineData = await fetchHiveEngineTokenBalances(username);
    if (engineData) {
      engineData.forEach((item) => {
        if (item) {
          const balance = _processCachedData(item.symbol, item.balance, parseToken(item.unclaimedBalance), claimsCache);
          const ppToken = hivePrice * (item.tokenPrice || 1);
          const volume24h = hivePrice * (item.volume24h || 0);

          const actions = [`${EngineActions.TRANSFER}_engine`]

          if (item.delegationEnabled) {
            actions.push(`${EngineActions.DELEGATE}_engine`);
          }

          if (item.delegationEnabled && item.delegationsOut) {
            actions.push(`${EngineActions.UNDELEGATE}_engine`);
          }

          if (item.stakingEnabled && item.balance > 0) {
            actions.push(`${EngineActions.STAKE}_engine`)
          }

          if (item.stake) {
            actions.push(`${EngineActions.UNSTAKE}_engine`)
          }

          engineCoinData[item.symbol] = {
            name: item.name || '',
            symbol: item.symbol,
            iconUrl: item.icon || '',
            balance: balance,
            estimateValue: balance * ppToken,
            vsCurrency: vsCurrency,
            currentPrice: ppToken,
            unclaimedBalance: item.unclaimedBalance,
            isEngine: true,
            percentChange: item.percentChange,
            precision: item.precision,
            actions,
            volume24h: volume24h,
            extraDataPairs: [{
              dataKey: 'staked',
              value: item.stake !== 0 ? `${item.stake}` : '0.00'
            }, {
              dataKey: 'delegations_in',
              value: item.delegationsIn !== 0 ? `${item.delegationsIn}` : '0.00'
            }, {
              dataKey: 'delegations_out',
              value: item.delegationsOut !== 0 ? `${item.delegationsOut}` : '0.00'
            }]
          };
        }
      });
    }
  } catch (err) {
    console.warn("failed to get engine tokens data", err);
  }

  return engineCoinData;


}



const _fetchSpkWalletData = async (username: string, hivePrice: number, vsCurrency: string, claimsCache: ClaimsCollection) => {
  const spkWalletData: { [key: string]: CoinData } = {};

  try {
    const spkWallet = await fetchSpkWallet(username);
    const _price = parseFloat(spkWallet.tick) * hivePrice

    if (spkWallet.spk) {
      const _symbol = ASSET_IDS.SPK
      const _spkBalance = spkWallet.spk / 1000;
  
      spkWalletData[_symbol] = {
        name: "SPK Network",
        symbol:_symbol,
        balance: _spkBalance,
        estimateValue: _spkBalance * _price,
        vsCurrency: vsCurrency,
        currentPrice: _price,
        isSpk: true,
        actions: [TransferTypes.TRANSFER_SPK]
      }
    }

    const _available = spkWallet.drop?.availible
    if (_available) {

      //compile larynx token
      const _larBalance = spkWallet.balance / 1000;

      spkWalletData[ASSET_IDS.LARYNX] = {
        name: ASSET_IDS.LARYNX + " Token",
        symbol: ASSET_IDS.LARYNX,
        balance: _larBalance,
        precision: _available.precision,
        estimateValue:_larBalance * _price,
        vsCurrency: vsCurrency,
        currentPrice: _price, 
        isSpk: true,
        actions: [
          TransferTypes.TRANSFER_LARYNX,
          TransferTypes.POWER_UP_SPK,
          // TransferTypes.LOCK_LIQUIDITY
        ]
      }


      //compile larynx power
      const _larPower = spkWallet.poweredUp / 1000;
      const _grantedPwr = spkWallet.granted?.t ? spkWallet.granted.t / 1000 : 0;
      const _grantingPwr = spkWallet.granting?.t ? spkWallet.granting.t / 1000 : 0;

      let _totalBalance = _larPower + _grantedPwr + _grantingPwr

      const _extraDataPairs:DataPair[] = [];
      if(spkWallet.power_downs){
        _extraDataPairs.push({
          dataKey: 'scheduled_power_downs',
          value: Object.keys(spkWallet.power_downs).length
        })
      }

      spkWalletData[ASSET_IDS.LARYNX_POWER] = {
        name: ASSET_IDS.LARYNX + " Power",
        symbol: ASSET_IDS.LARYNX_POWER,
        balance: _larPower,
        precision: _available.precision,
        estimateValue: _larPower * _price,
        vsCurrency: vsCurrency,
        currentPrice: _price, 
        isSpk: true,
        extraDataPairs:[..._extraDataPairs,
          {
          dataKey: 'delegated_larynx_power',
          value: `${_grantedPwr.toFixed(3)} ${ASSET_IDS.LARYNX_POWER}`
        },{
          dataKey: 'delegating_larynx_power',
          value: `- ${ _grantingPwr.toFixed(3)} ${ASSET_IDS.LARYNX_POWER}`
        }, {
          dataKey: 'total_larynx_power',
          value: `${ _totalBalance.toFixed(3)} ${ASSET_IDS.LARYNX_POWER}`
        },],
        actions: [
          TransferTypes.DELEGATE_SPK,
          TransferTypes.POWER_DOWN_SPK,
        ]
      }
    }


  } catch (err) {
    console.warn("Failed to get spk data", err);
  }

  return spkWalletData
}


const _processCachedData = (assetId: string, balance: number = 0, unclaimedBalance: number, claimsCache: ClaimsCollection) => {

  const rewardHpStrToToken = (rewardStr: string) => {
    let tokenAmount = 0;
    rewardStr.split('   ').forEach((str => {
      const asset = parseAsset(str);
      if (asset.symbol === assetId) {
        tokenAmount = asset.amount
      }
    }))
    return tokenAmount;
  }

  if (claimsCache) {
    const _curTime = new Date().getTime();

    let rewardClaimed = 0;
    let _claim = claimsCache[assetId];
    switch (assetId) {
      case ASSET_IDS.HBD:
      case ASSET_IDS.HIVE:
      case ASSET_IDS.HP:
        _claim = claimsCache[ASSET_IDS.HP];
        if (_claim) {
          rewardClaimed = rewardHpStrToToken(_claim.rewardValue);
        }
        break;
      default:
        if (_claim) {
          rewardClaimed = parseToken(_claim.rewardValue);
        }

        break;
    }

    if (_claim && (_claim.expiresAt || 0) > _curTime && rewardClaimed === unclaimedBalance) {
      balance = balance + rewardClaimed;
    }

  }

  return balance
}


export const fetchCoinsData = async ({
  coins,
  currentAccount,
  vsCurrency,
  currencyRate,
  globalProps,
  refresh,
  quotes,
  claimsCache
}: {
  coins: CoinBase[];
  currentAccount: any;
  vsCurrency: string;
  currencyRate: number;
  globalProps: GlobalProps;
  quotes: { [key: string]: QuoteItem };
  refresh: boolean;
  claimsCache: ClaimsCollection
}): Promise<{ [key: string]: CoinData }> => {
  const username = currentAccount.username;
  let coinData = {} as { [key: string]: CoinData };
  const walletData = {};

  if (!username) {
    return walletData;
  }

  //fetch latest global props if refresh or data not available
  const { base, quote, hivePerMVests } =
    refresh || !globalProps || !globalProps.hivePerMVests ? await fetchGlobalProps() : globalProps;
  //TODO: Use already available accoutn for frist wallet start
  const userdata = refresh ? await getAccount(username) : currentAccount;
  const _pointsSummary = refresh || !currentAccount?.pointsSummary ? await getPointsSummary(username) : currentAccount.pointsSummary;
  //TODO: cache data in redux or fetch once on wallet startup
  const _prices = !refresh && quotes ? quotes : await getLatestQuotes(currencyRate); //TODO: figure out a way to handle other currencies



  coins.forEach((coinBase) => {
    switch (coinBase.id) {
      case ASSET_IDS.ECENCY: {
        const unclaimedFloat = parseFloat(_pointsSummary.unclaimed_points || '0');
        let balance = _pointsSummary.points ? parseFloat(_pointsSummary.points) : 0;
        balance = _processCachedData(coinBase.id, balance, unclaimedFloat, claimsCache);

        const unclaimedBalance = unclaimedFloat ? unclaimedFloat + ' Points' : '';
        const ppEstm = _prices[coinBase.id].price;

        coinData[coinBase.id] = {
          balance: Math.round(balance * 1000) / 1000,
          estimateValue: balance * ppEstm,
          vsCurrency: vsCurrency,
          currentPrice: ppEstm,
          unclaimedBalance: unclaimedBalance,
          actions: ECENCY_ACTIONS,
        };
        break;
      }
      case ASSET_IDS.HIVE: {
        const balance = _processCachedData(coinBase.id, parseToken(userdata.balance), parseToken(userdata.reward_hive_balance), claimsCache);
        const savings = parseToken(userdata.savings_balance);
        const ppHive = _prices[coinBase.id].price;

        coinData[coinBase.id] = {
          balance: Math.round(balance * 1000) / 1000,
          estimateValue: (balance + savings) * ppHive,
          savings: Math.round(savings * 1000) / 1000,
          vsCurrency: vsCurrency,
          currentPrice: ppHive,
          unclaimedBalance: '',
          actions: HIVE_ACTIONS,
        };
        break;
      }

      case ASSET_IDS.HBD: {
        const balance = _processCachedData(coinBase.id, parseToken(userdata.hbd_balance), parseToken(userdata.reward_hbd_balance), claimsCache);
        const savings = parseToken(userdata.savings_hbd_balance);
        const ppHbd = _prices[coinBase.id].price;

        coinData[coinBase.id] = {
          balance: Math.round(balance * 1000) / 1000,
          estimateValue: (balance + savings) * ppHbd,
          savings: Math.round(savings * 1000) / 1000,
          vsCurrency: vsCurrency,
          currentPrice: ppHbd,
          unclaimedBalance: '',
          actions: HBD_ACTIONS,
        };
        break;
      }
      case ASSET_IDS.HP: {

        let balance =
          Math.round(vestsToHp(parseToken(userdata.vesting_shares), hivePerMVests) * 1000) / 1000;

        balance = _processCachedData(coinBase.id, balance, parseToken(userdata.vesting_shares), claimsCache);

        const receivedHP = vestsToHp(parseToken(userdata.received_vesting_shares), hivePerMVests);
        const delegatedHP = vestsToHp(parseToken(userdata.delegated_vesting_shares), hivePerMVests);

        //agggregate claim button text
        const _getBalanceStr = (val: number, cur: string) =>
          val ? Math.round(val * 1000) / 1000 + cur : '';
        const unclaimedBalance = [
          _getBalanceStr(parseToken(userdata.reward_hive_balance), ' HIVE'),
          _getBalanceStr(parseToken(userdata.reward_hbd_balance), ' HBD'),
          _getBalanceStr(parseToken(userdata.vesting_shares), ' HP'),
        ].reduce(
          (prevVal, bal) => prevVal + (!bal ? '' : `${prevVal !== '' ? '   ' : ''}${bal}`),
          '',
        );

        //calculate power down
        const isPoweringDown = userdata.next_vesting_withdrawal
          ? parseDate(userdata.next_vesting_withdrawal) > new Date()
          : false;

        const nextVestingSharesWithdrawal = isPoweringDown
          ? Math.min(
            parseAsset(userdata.vesting_withdraw_rate).amount,
            (Number(userdata.to_withdraw) - Number(userdata.withdrawn)) / 1e6,
          )
          : 0;
        const nextVestingSharesWithdrawalHive = isPoweringDown
          ? vestsToHp(nextVestingSharesWithdrawal, hivePerMVests)
          : 0;

        const estimateVoteValueStr = '$ ' + getEstimatedAmount(userdata, globalProps);

        //aaggregate extra data pairs
        const extraDataPairs: DataPair[] = [];

        if (delegatedHP) {
          extraDataPairs.push({
            dataKey: 'delegated_hive_power',
            value: `- ${delegatedHP.toFixed(3)} HP`,
            isClickable: true,
          });
        }

        if (receivedHP) {
          extraDataPairs.push({
            dataKey: 'received_hive_power',
            value: `+ ${receivedHP.toFixed(3)} HP`,
            isClickable: true,
          });
        }

        if (nextVestingSharesWithdrawalHive) {
          extraDataPairs.push({
            dataKey: 'powering_down_hive_power',
            value: `- ${nextVestingSharesWithdrawalHive.toFixed(3)} HP`,
          });
        }

        extraDataPairs.concat([
          {
            dataKey: 'total_hive_power',
            value: `${(
              balance -
              delegatedHP +
              receivedHP -
              nextVestingSharesWithdrawalHive
            ).toFixed(3)} HP`,
          },
          {
            dataKey: 'vote_value',
            value: estimateVoteValueStr,
          },
        ]);

        const ppHive = _prices[ASSET_IDS.HIVE].price;
        coinData[coinBase.id] = {
          balance: Math.round(balance * 1000) / 1000,
          estimateValue: balance * ppHive,
          unclaimedBalance,
          vsCurrency: vsCurrency,
          currentPrice: ppHive,
          actions: HIVE_POWER_ACTIONS,
          extraDataPairs: [
            ...extraDataPairs,
            {
              dataKey: 'total_hive_power',
              value: `${(
                balance -
                delegatedHP +
                receivedHP -
                nextVestingSharesWithdrawalHive
              ).toFixed(3)} HP`,
            },
            {
              dataKey: 'vote_value',
              value: estimateVoteValueStr,
            },
          ],
        };
        break;
      }

      default:
        break;
    }
  });


  const engineCoinsData = await fetchEngineTokensData(username, _prices.hive.price, vsCurrency, claimsCache);
  const spkWalletData = await _fetchSpkWalletData(username, _prices.hive.price, vsCurrency, claimsCache);
  coinData = { ...coinData, ...engineCoinsData, ...spkWalletData };


  //TODO:discard unnessacry data processings towards the end of PR
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

  walletData.hivePerMVests = hivePerMVests;
  const pricePerHive = base / quote;

  const totalHive =
    vestsToHp(walletData.vestingShares, walletData.hivePerMVests) +
    walletData.balance +
    walletData.savingBalance;

  const totalHbd = walletData.hbdBalance + walletData.savingBalanceHbd;

  walletData.estimatedValue = totalHive * pricePerHive + totalHbd;

  walletData.showPowerDown = userdata.next_vesting_withdrawal !== '1969-12-31T23:59:59';
  const timeDiff = Math.abs(parseDate(userdata.next_vesting_withdrawal) - new Date());
  walletData.nextVestingWithdrawal = Math.round(timeDiff / (1000 * 3600));

  return coinData;
};

function compare(a, b) {
  if (a[1].block < b[1].block) {
    return 1;
  }
  if (a[1].block > b[1].block) {
    return -1;
  }
  return 0;
}

export const groomingPointsTransactionData = (transaction) => {
  if (!transaction) {
    return null;
  }
  const result = {
    ...transaction,
  };

  result.details = transaction.sender ? `from @${transaction.sender}`
    : transaction.receiver && `to @${transaction.receiver}`;

  result.value = `${transaction.amount} Points`;
  result.trxIndex = transaction.id;

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
