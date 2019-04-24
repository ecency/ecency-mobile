import parseDate from './parseDate';
import parseToken from './parseToken';
import { vestsToSp } from './conversions';
import { getState, getFeedHistory } from '../providers/steem/dsteem';

export const groomingTransactionData = (transaction, steemPerMVests, formatNumber) => {
  if (!transaction || !steemPerMVests) {
    return [];
  }

  const result = {};

  // eslint-disable-next-line
  result.opName = transaction[1].op[0];
  const opData = transaction[1].op[1];
  const { timestamp } = transaction[1];

  result.transDate = timestamp;
  result.icon = 'local-activity';

  switch (result.opName) {
    case 'curation_reward':
      const { reward } = opData;
      const { comment_author: commentAuthor, comment_permlink: commentPermlink } = opData;

      result.value = `${formatNumber(vestsToSp(parseToken(reward), steemPerMVests), {
        minimumFractionDigits: 3,
      })} SP`;
      result.details = `@${commentAuthor}/${commentPermlink}`;
      break;
    case 'author_reward':
    case 'comment_benefactor_reward':
      let {
        sbd_payout: sbdPayout,
        steem_payout: steemPayout,
        vesting_payout: vestingPayout,
      } = opData;

      const { author, permlink } = opData;

      sbdPayout = formatNumber(parseToken(sbdPayout), { minimumFractionDigits: 3 });
      steemPayout = formatNumber(parseToken(steemPayout), { minimumFractionDigits: 3 });
      vestingPayout = formatNumber(vestsToSp(parseToken(vestingPayout), steemPerMVests), {
        minimumFractionDigits: 3,
      });

      result.value = `${sbdPayout > 0 ? `${sbdPayout} SBD` : ''} ${
        steemPayout > 0 ? `${steemPayout} steemPayout` : ''
      } ${vestingPayout > 0 ? `${vestingPayout} SP` : ''}`;

      result.details = `@${author}/${permlink}`;
      if (result.opName === 'comment_benefactor_reward') {
        result.icon = 'comment';
      }
      break;
    case 'claim_reward_balance':
      let { reward_sbd: rewardSdb, reward_steem: rewardSteem, reward_vests: rewardVests } = opData;

      rewardSdb = formatNumber(parseToken(rewardSdb), { minimumFractionDigits: 3 });
      rewardSteem = formatNumber(parseToken(rewardSteem), { minimumFractionDigits: 3 });
      rewardVests = formatNumber(vestsToSp(parseToken(rewardVests), steemPerMVests), {
        minimumFractionDigits: 3,
      });

      result.value = `${rewardSdb > 0 ? `${rewardSdb} SBD` : ''} ${
        rewardSteem > 0 ? `${rewardSteem} STEEM` : ''
      } ${rewardVests > 0 ? `${rewardVests} SP` : ''}`;
      break;
    case 'transfer':
    case 'transfer_to_vesting':
      const {
        amount, memo, from, to,
      } = opData;

      result.value = `${amount}`;
      result.icon = 'compare-arrows';
      result.details = `@${from} to @${to}`;
      result.memo = memo;
      break;
    case 'withdraw_vesting':
      const { acc } = opData;
      let { vesting_shares: opVestingShares } = opData;

      opVestingShares = parseToken(opVestingShares);
      result.value = `${formatNumber(vestsToSp(opVestingShares, steemPerMVests), {
        minimumFractionDigits: 3,
      })} SP`;
      result.icon = 'attach-money';
      result.details = `@${acc}`;
      break;
    case 'fill_order':
      const { current_pays: currentPays, open_pays: openPays } = opData;

      result.value = `${currentPays} = ${openPays}`;
      result.icon = 'reorder';
      break;
    default:
      return [];
  }
  return result;
};

export const groomingWalletData = async (user, globalProps) => {
  const walletData = {};

  if (!user) {
    return walletData;
  }

  const state = await getState(`/@${user.name}/transfers`);
  const { accounts } = state;

  // TODO: move them to utils these so big for a lifecycle function
  walletData.rewardSteemBalance = parseToken(user.reward_steem_balance);
  walletData.rewardSbdBalance = parseToken(user.reward_sbd_balance);
  walletData.rewardVestingSteem = parseToken(user.reward_vesting_steem);
  walletData.hasUnclaimedRewards = walletData.rewardSteemBalance > 0
    || walletData.rewardSbdBalance > 0
    || walletData.rewardVestingSteem > 0;
  walletData.balance = parseToken(user.balance);
  walletData.vestingShares = parseToken(user.vesting_shares);
  walletData.vestingSharesDelegated = parseToken(user.delegated_vesting_shares);
  walletData.vestingSharesReceived = parseToken(user.received_vesting_shares);
  walletData.vestingSharesTotal = walletData.vestingShares - walletData.vestingSharesDelegated + walletData.vestingSharesReceived;

  walletData.sbdBalance = parseToken(user.sbd_balance);
  walletData.savingBalance = parseToken(user.savings_balance);
  walletData.savingBalanceSbd = parseToken(user.savings_sbd_balance);

  const feedHistory = await getFeedHistory();
  const base = parseToken(feedHistory.current_median_history.base);
  const quote = parseToken(feedHistory.current_median_history.quote);

  walletData.steemPerMVests = globalProps.steemPerMVests;

  const pricePerSteem = base / quote;

  const totalSteem = vestsToSp(walletData.vestingShares, walletData.steemPerMVests)
    + walletData.balance
    + walletData.savingBalance;

  const totalSbd = walletData.sbdBalance + walletData.savingBalanceSbd;

  walletData.estimatedValue = totalSteem * pricePerSteem + totalSbd;

  walletData.showPowerDown = user.next_vesting_withdrawal !== '1969-12-31T23:59:59';
  const timeDiff = Math.abs(parseDate(user.next_vesting_withdrawal) - new Date());
  walletData.nextVestingWithdrawal = Math.ceil(timeDiff / (1000 * 3600 * 24));

  const { transfer_history: transferHistory } = accounts[user.name];
  walletData.transactions = transferHistory
    .slice(Math.max(transferHistory.length - 20, 0))
    .reverse();

  return walletData;
};
