import CryptoJS from 'crypto-js';

const STAMP = '995a06d5-ee54-407f-bb8e-e4af2ab2fe01';

interface StampedData {
  data: string;
  stamp: string;
}

export const encryptKey = (data: string, key: string): string => {
  console.log('encrypting: ', data, key);
  const stampedData = getStampedData(data);
  const encJson = CryptoJS.AES.encrypt(JSON.stringify(stampedData), key).toString();
  const encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
  console.log('returning: ', encData);
  return encData;
};

export const decryptKey = (
  data: string,
  key: string,
  onError?: (err: unknown) => void,
): string | undefined => {
  try {
    const response = decryptKeyNew(data, key);
    return response;
  } catch (err) {
    console.log('decryption with new method failed, trying legacy', err);
    if (onError) {
      onError(err);
    }
  }
};

const decryptKeyNew = (data: string, key: string): string => {
  console.log('decrypting new: ', data, key);
  const decData = CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
  const bytes = CryptoJS.AES.decrypt(decData, key).toString(CryptoJS.enc.Utf8);
  const stampedData: StampedData = JSON.parse(bytes);
  const ret = processStampedData(stampedData);
  console.log('returning: ', ret);
  return ret;
};

// stamping mechanism will help distinguish old legacy data and new encrypted data
// second purpose is to avoid necrypting empty strings
const getStampedData = (data: string): StampedData => {
  return {
    data,
    stamp: STAMP,
  };
};

const processStampedData = (stampedData: StampedData): string => {
  if (stampedData?.stamp && stampedData.stamp == STAMP) {
    return stampedData.data;
  }
  throw new Error('Possibly un-stamped legacy data');
};

export const decodeBase64 = (code: string): string | null => {
  try {
    return CryptoJS.enc.Base64.parse(code).toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.warn('base64 decode failed', (err as Error).message);
    return null;
  }
};
