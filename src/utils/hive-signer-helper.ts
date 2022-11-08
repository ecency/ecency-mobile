import { cryptoUtils, PrivateKey } from '@hiveio/dhive';
import { b64uEnc } from './b64';

export interface HiveSignerMessage {
  signed_message: {
    type: string;
    app: string;
  };
  authors: string[];
  timestamp: number;
  signatures?: string[];
}

export const makeHsCode = async (account: string, privateKey: PrivateKey): Promise<string> => {
  const timestamp = new Date().getTime() / 1000;
  const messageObj: HiveSignerMessage = {
    signed_message: { type: 'code', app: 'ecency.app' },
    authors: [account],
    timestamp,
  };
  const message = JSON.stringify(messageObj);
  const signature = signer(message, privateKey);
  messageObj.signatures = [signature];
  return b64uEnc(JSON.stringify(messageObj));
};

export const signer = (message: any, privateKey: PrivateKey) => {
  const hash = cryptoUtils.sha256(message);
  const key = privateKey;
  const signedKey = key.sign(hash);
  const signedStr = signedKey.toString();
  return signedStr;
};
