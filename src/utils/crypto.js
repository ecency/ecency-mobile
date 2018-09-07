import CryptoJS from "crypto-js";

export const encryptKey = (key, pinCode) => {
    return CryptoJS.AES.encrypt(key, pinCode).toString();
};

export const decryptKey = (key, pinCode) => {
    return CryptoJS.AES.decrypt(key, pinCode).toString(CryptoJS.enc.Utf8);
};
