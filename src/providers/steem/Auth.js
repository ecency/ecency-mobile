import * as dsteem from 'dsteem';

export const LoginWithPostingKey = (publicKey, privateKey) => {
  if (publicKey == dsteem.PrivateKey.fromString(privateKey).createPublic()) {
    return true;
  }
}

export const LoginWithMasterKey = (username, publicKey, masterKey) => {
  if (publicKey == dsteem.PrivateKey.fromLogin(username, masterKey, 'posting').createPublic()) {
    return true;
  }
}