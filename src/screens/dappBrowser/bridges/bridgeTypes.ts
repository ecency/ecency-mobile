export interface KeychainRequest {
  name: 'swRequest_hive' | 'swHandshake_hive';
  request_id: number;
  data: {
    type: string;
    username?: string;
    domain?: string;
    method?: string;
    [key: string]: any;
  };
}

export interface KeychainResponse {
  success: boolean;
  error: string | null;
  result: any;
  message?: string;
  data?: any;
  request_id: number;
  publicKey?: string;
}

export interface PeakVaultRequest {
  name: 'pvRequest';
  data: {
    id: 'sign-request';
    resId: number;
    account: string;
    operations: any[];
    keyRole: 'posting' | 'active' | 'memo';
    broadcast: boolean;
    displayMessage: string | { title: string; message?: string };
    sourceUrl?: string;
    rpc?: string;
    transaction?: any;
    [key: string]: any;
  };
}

export interface PeakVaultResponse {
  success: boolean;
  error: string;
  message?: string;
  account: string;
  publicKey?: string;
  result: any;
}

export type AuthorityLevel = 'posting' | 'active' | 'memo';

/** Default authority for each operation type. Some types use `method` param to override. */
export const OPERATION_AUTHORITY: Record<string, AuthorityLevel> = {
  vote: 'posting',
  post: 'posting',
  custom: 'posting',
  signBuffer: 'posting',
  addAccountAuthority: 'active',
  removeAccountAuthority: 'active',
  addKeyAuthority: 'active',
  removeKeyAuthority: 'active',
  broadcast: 'active',
  signTx: 'active',
  transfer: 'active',
  sendToken: 'active',
  delegation: 'active',
  witnessVote: 'active',
  proxy: 'active',
  powerUp: 'active',
  powerDown: 'active',
  createClaimedAccount: 'active',
  createProposal: 'active',
  removeProposal: 'active',
  updateProposalVote: 'active',
  convert: 'active',
  recurrentTransfer: 'active',
  savings: 'active',
  swap: 'active',
  signedCall: 'posting', // typically uses posting key for API calls
  addAccount: 'active', // requires active key to add account to keychain
  encode: 'memo',
  decode: 'memo',
};

/** Types where the `method` param from the request should override the default authority */
export const METHOD_OVERRIDE_TYPES = new Set([
  'custom',
  'signBuffer',
  'broadcast',
  'signTx',
  'signedCall',
  'encode',
  'decode',
]);

export function getRequiredAuthority(type: string, method?: string): AuthorityLevel {
  if (method && METHOD_OVERRIDE_TYPES.has(type)) {
    const normalized = method.toLowerCase() as AuthorityLevel;
    if (normalized === 'posting' || normalized === 'active' || normalized === 'memo') {
      return normalized;
    }
  }
  return OPERATION_AUTHORITY[type] || 'active';
}

/** Human-readable labels for operation types */
export const OPERATION_LABELS: Record<string, string> = {
  vote: 'Vote',
  post: 'Post/Comment',
  custom: 'Custom JSON',
  signBuffer: 'Sign Message',
  transfer: 'Transfer',
  sendToken: 'Send Token',
  delegation: 'Delegation',
  witnessVote: 'Witness Vote',
  proxy: 'Set Proxy',
  powerUp: 'Power Up',
  powerDown: 'Power Down',
  broadcast: 'Broadcast',
  signTx: 'Sign Transaction',
  encode: 'Encode Message',
  decode: 'Verify Key',
  addAccountAuthority: 'Add Account Authority',
  removeAccountAuthority: 'Remove Account Authority',
  addKeyAuthority: 'Add Key Authority',
  removeKeyAuthority: 'Remove Key Authority',
  createClaimedAccount: 'Create Account',
  createProposal: 'Create Proposal',
  removeProposal: 'Remove Proposal',
  updateProposalVote: 'Proposal Vote',
  convert: 'Convert',
  recurrentTransfer: 'Recurrent Transfer',
  savings: 'Savings',
  swap: 'Swap',
  signedCall: 'Signed Call',
  addAccount: 'Add Account',
};
