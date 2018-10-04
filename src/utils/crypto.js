import CryptoJS from 'crypto-js';

export const encryptKey = (key, pinCode) => CryptoJS.AES.encrypt(key, pinCode).toString();

export const decryptKey = (key, pinCode) => CryptoJS.AES.decrypt(key, pinCode).toString(CryptoJS.enc.Utf8);
