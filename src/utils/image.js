import CryptoJS from 'crypto-js';
import * as dsteem from 'dsteem';
import { Buffer } from 'buffer';

export const generateSignature = (media, privateKey) => {
  const STRING = 'ImageSigningChallenge';
  const prefix = new Buffer(STRING);

  const commaIdx = media.data.indexOf(',');
  const dataBs64 = media.data.substring(commaIdx + 1);
  const data = new Buffer(dataBs64, 'base64');

  const hash = CryptoJS.SHA256(prefix, data);
  const buffer = Buffer.from(hash.toString(CryptoJS.enc.Hex), 'hex');
  const array = new Uint8Array(buffer);
  const key = dsteem.PrivateKey.fromString(privateKey);

  return key.sign(new Buffer(array)).toString();
};
