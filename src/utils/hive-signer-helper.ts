import { PrivateKey, sha256 } from '@ecency/sdk';
import { b64uEnc } from './b64';

export interface HiveSignerMessage {
  signed_message: {
    type: string;
    app: string;
    audience?: string;
  };
  authors: string[];
  timestamp: number;
  signatures?: string[];
}

// The HiveSigner app every message here is signed for. Receivers that verify
// codes and proofs themselves check this name.
const HS_APP = 'ecency.app';

const signHsMessage = (messageObj: HiveSignerMessage, privateKey: PrivateKey) => {
  const message = JSON.stringify(messageObj);
  const signature = signer(message, privateKey);
  messageObj.signatures = [signature];
  return b64uEnc(JSON.stringify(messageObj));
};

// A HiveSigner code: what login exchanges for the account's access and
// refresh tokens. HiveSigner never expires it, so it only ever goes to
// Ecency's own token exchange.
export const makeHsCode = (account: string, privateKey: PrivateKey) => {
  const timestamp = new Date().getTime() / 1000;
  return signHsMessage(
    { signed_message: { type: 'code', app: HS_APP }, authors: [account], timestamp },
    privateKey,
  );
};

// A sign-in proof for another app. Signed like a code but typed login:
// HiveSigner answers /api/me with the account for it, refuses it at the token
// route (the role is not code) and refuses every operation at broadcast (the
// scope is login), so Ecency's code exchange refuses it too. The app stays
// ecency.app, which is what receivers verify against; the audience names the
// receiver, so a proof handed to one app is refused by another that checks
// it. Receivers verify the signature against the account's keys on chain or
// through /api/me and check the timestamp themselves: HiveSigner does not.
export const makeHsLoginProof = (account: string, privateKey: PrivateKey, audience: string) => {
  const timestamp = new Date().getTime() / 1000;
  return signHsMessage(
    { signed_message: { type: 'login', app: HS_APP, audience }, authors: [account], timestamp },
    privateKey,
  );
};

export const signer = (message: any, privateKey: PrivateKey) => {
  const hash = sha256(message);
  const key = privateKey;
  const signedKey = key.sign(hash);
  const signedStr = signedKey.toString();
  return signedStr;
};
