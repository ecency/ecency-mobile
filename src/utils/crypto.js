import CryptoJS from 'crypto-js';

const STAMP = '995a06d5-ee54-407f-bb8e-e4af2ab2fe01';

export const encryptKey = (data, key) => {
  console.log('encrypting: ', data, key);
  const stampedData = getStampedData(data);
  const encJson = CryptoJS.AES.encrypt(JSON.stringify(stampedData), key).toString();
  const encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
  console.log('returning: ', encData);
  return encData;
};

export const decryptKey = (data, key, onError) => {
  const legacyDecrypt = () => decryptKeyLegacy(data, key, onError);

  try {
    const response = decryptKeyNew(data, key);
    return response;
  } catch (err) {
    console.warn('decryption with new method failed, trying legacy', err);
    return legacyDecrypt();
  }
};

const decryptKeyNew = (data, key) => {
  console.log('decrypting new: ', data, key);
  const decData = CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
  const bytes = CryptoJS.AES.decrypt(decData, key).toString(CryptoJS.enc.Utf8);
  const stampedData = JSON.parse(bytes);
  const ret = processStampedData(stampedData);
  console.log('returning: ', ret);
  return ret;
};

const decryptKeyLegacy = (data, key, onError) => {
  try {
    console.log('decrypting legacy ', data, key);
    const ret = CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
    console.log('returning: ', ret);
    return ret;
  } catch (err) {
    console.warn('decryption with legacy failed as well');
    if (onError) {
      onError(err);
    }
  }
};

// stamping mechanism will help distinguish old legacy data and new encrypted data
// second purpose is to avoid necrypting empty strings
const getStampedData = (data) => {
  return {
    data,
    stamp: STAMP,
  };
};

const processStampedData = (stampedData) => {
  if (stampedData?.stamp && stampedData.stamp == STAMP) {
    return stampedData.data;
  }
  throw new Error('Possibly un-stamped legacy data');
};

export const decodeBase64 = (code) => {
  try {
    return CryptoJS.enc.Base64.parse(code).toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.warn('base64 decode failed', err.message);
    return null;
  }
};
