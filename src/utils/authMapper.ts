import AUTH_TYPE from '../constants/authType';

/**
 * Maps mobile authType to SDK LoginType
 * SDK expects: "hivesigner" | "keychain" | "hiveauth" | "privateKey"
 * Mobile uses: 'steemConnect', 'hiveAuth', 'masterKey', 'activeKey', 'postingKey', etc.
 */
export const mapAuthTypeToLoginType = (
  authType: string,
): 'hivesigner' | 'hiveauth' | 'privateKey' => {
  switch (authType) {
    case AUTH_TYPE.STEEM_CONNECT:
      return 'hivesigner';
    case AUTH_TYPE.HIVE_AUTH:
      return 'hiveauth';
    case AUTH_TYPE.MASTER_KEY:
    case AUTH_TYPE.ACTIVE_KEY:
    case AUTH_TYPE.MEMO_KEY:
    case AUTH_TYPE.POSTING_KEY:
    case AUTH_TYPE.OWNER_KEY:
      return 'privateKey';
    default:
      console.warn(`[AuthMapper] Unknown authType: ${authType}, defaulting to privateKey`);
      return 'privateKey';
  }
};
