export default {
  999: {
    icon: 'compare-arrows',
    textKey: 'incoming_transfer_title',
    nameKey: 'wallet.incoming_transfer',
    descriptionKey: 'wallet.incoming_transfer_description',
    iconType: 'MaterialIcons',
    point: 0.1,
  },
  998: {
    icon: 'compare-arrows',
    textKey: 'outgoing_transfer_title',
    nameKey: 'wallet.outgoing_transfer',
    descriptionKey: 'wallet.outgoing_transfer_description',
    iconType: 'MaterialIcons',
    point: 0.1,
  },
  160: {
    icon: 'target',
    textKey: 'referral_title',
    nameKey: 'wallet.referral',
    descriptionKey: 'wallet.referral_desc',
    iconType: 'MaterialCommunityIcons',
    point: 100,
  },
  150: {
    icon: 'arrow-collapse-all',
    textKey: 'delegation_title',
    nameKey: 'wallet.delegation',
    descriptionKey: 'wallet.delegation_desc',
    iconType: 'MaterialCommunityIcons',
    point: 10,
  },
  100: {
    icon: 'pencil-outline',
    textKey: 'post_title',
    nameKey: 'wallet.post',
    descriptionKey: 'wallet.post_desc',
    iconType: 'MaterialCommunityIcons',
    point: 15,
  },
  110: {
    icon: 'comment-outline',
    textKey: 'comment_title',
    nameKey: 'wallet.comment',
    descriptionKey: 'wallet.comment_desc',
    iconType: 'MaterialCommunityIcons',
    point: 5,
  },
  120: {
    icon: 'chevron-up-circle-outline',
    textKey: 'vote_title',
    nameKey: 'wallet.vote',
    descriptionKey: 'wallet.vote_desc',
    iconType: 'MaterialCommunityIcons',
    point: 0.3,
  },
  130: {
    icon: 'repeat',
    textKey: 'reblog_title',
    nameKey: 'wallet.reblog',
    descriptionKey: 'wallet.reblog_desc',
    iconType: 'MaterialIcons',
    point: 1,
  },
  10: {
    icon: 'progress-check',
    textKey: 'checkin_title',
    nameKey: 'wallet.checkin',
    descriptionKey: 'wallet.checkin_desc',
    iconType: 'MaterialCommunityIcons',
    point: 0.25,
  },
  20: {
    icon: 'person-outline',
    textKey: 'login_title',
    nameKey: 'wallet.login',
    descriptionKey: 'wallet.login_desc',
    iconType: 'MaterialIcons',
    point: 10,
  },
  30: {
    icon: 'check-all',
    textKey: 'checkin_extra_title',
    nameKey: 'wallet.checkin_extra',
    descriptionKey: 'wallet.checkin_extra_desc',
    iconType: 'MaterialCommunityIcons',
    point: 10,
  },
};

export const POINTS_KEYS = [
  {
    type: 160,
  },
  {
    type: 150,
  },
  {
    type: 100,
  },
  {
    type: 110,
  },
  {
    type: 120,
  },
  {
    type: 130,
  },
  {
    type: 10,
  },
  {
    type: 20,
  },
  {
    type: 30,
  },
];

export const PROMOTE_PRICING = [
  { duration: 1, price: 150 },
  { duration: 2, price: 250 },
  { duration: 3, price: 350 },
  { duration: 7, price: 500 },
  { duration: 14, price: 1000 },
];
export const PROMOTE_DAYS = [1, 2, 3, 7, 14];

export const PROMOTE_STATUS_PENDING = 1;
export const PROMOTE_STATUS_SUCCESS = 2;
export const PROMOTE_STATUS_USER_ERR = 3;
export const PROMOTE_STATUS_INSUFFICIENT_ERR = 4;
export const PROMOTE_STATUS_POST_ERR = 5;
export const PROMOTE_STATUS_POST_DUPLICATE = 6;
export const PROMOTE_STATUS_FORMAT_ERR = 7;

export const PROMOTED_POST_STATUS_ON = 1;
export const PROMOTED_POST_STATUS_EXPIRED = 2;
export const PROMOTED_POST_STATUS_DISABLED = 3;
