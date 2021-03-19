import CryptoJS from 'crypto-js';

export const encryptKey = (data, key) => {
  console.log('encrypting: ', data, key);
  const encJson = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  let encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
  console.log('returning: ', encData);
  return encData;
};

export const decryptKey = (data, key, onError) => {
  const legacyDecrypt = () => decryptKeyLegacy(data, key, onError);

  try {
    const response = decryptKeyNew(data, key);
    return response !== '' ? response : legacyDecrypt();
  } catch (err) {
    console.warn('decryption with new method failed, trying legacy', err);
    return legacyDecrypt();
  }
};

const decryptKeyNew = (data, key) => {
  console.log('decrypting new: ', data, key);
  let decData = CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
  let bytes = CryptoJS.AES.decrypt(decData, key).toString(CryptoJS.enc.Utf8);
  const ret = JSON.parse(bytes);
  console.log('returning: ', ret);
  return ret;
};

const decryptKeyLegacy = (data, key, onError) => {
  try {
    console.log('decrypting legacy ', data, key);
    const ret = CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
    if (ret == '' && onError) {
      onError(new Error('invalid decryption'));
    }
    console.log('returning: ', ret);
    return ret;
  } catch (err) {
    console.warn('decryption with legacy failed as well');
    if (onError) {
      onError(err);
    }
  }
};
