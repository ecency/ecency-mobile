import parseToken from './parseToken';
import parseDate from './parseDate';
import { vestsToSp } from './conversions';

export const getTransactionData = (transaction, walletData, formatNumber) => {
  const result = {};

  // eslint-disable-next-line
  result.opName = transaction[1].op[0];
  const opData = transaction[1].op[1];
  const { timestamp } = transaction[1];

  result.transDate = parseDate(timestamp);
  result.icon = 'local-activity';

  switch (result.opName) {
    case 'curation_reward':
      const { reward } = opData;
      const { comment_author: commentAuthor, comment_permlink: commentPermlink } = opData;

      result.value = `${formatNumber(vestsToSp(parseToken(reward), walletData.steemPerMVests), {
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
      vestingPayout = formatNumber(
        vestsToSp(parseToken(vestingPayout), walletData.steemPerMVests),
        { minimumFractionDigits: 3 },
      );

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
      rewardVests = formatNumber(vestsToSp(parseToken(rewardVests), walletData.steemPerMVests), {
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
      result.value = `${formatNumber(vestsToSp(opVestingShares, walletData.steemPerMVests), {
        minimumFractionDigits: 3,
      })} SP`;
      result.icon = 'money';
      result.details = `@${acc}`;
      break;
    case 'fill_order':
      const { current_pays: currentPays, open_pays: openPays } = opData;

      result.value = `${currentPays} = ${openPays}`;
      result.icon = 'reorder';
      break;
    default:
      break;
  }
  return result;
};
