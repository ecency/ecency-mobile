import CryptoJS from 'crypto-js';

export const encryptKey = (data, key) => {
  const encJson = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  let encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
  return encData;
};

export const decryptKey = (data, key) => {
  let decData = CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
  let bytes = CryptoJS.AES.decrypt(decData, key).toString(CryptoJS.enc.Utf8);
  return JSON.parse(bytes);
};
