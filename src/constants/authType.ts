const STEEM_CONNECT = 'steemConnect';
const HIVE_AUTH = 'hiveAuth';
const MASTER_KEY = 'masterKey';
const ACTIVE_KEY = 'activeKey';
const MEMO_KEY = 'memoKey';
const POSTING_KEY = 'postingKey';
const OWNER_KEY = 'ownerKey';

const AUTH_TYPE = {
  STEEM_CONNECT,
  HIVE_AUTH,
  MASTER_KEY,
  ACTIVE_KEY,
  MEMO_KEY,
  POSTING_KEY,
  OWNER_KEY,
} as const;

export default AUTH_TYPE;
