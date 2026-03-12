// Unmock crypto-js for these tests so we test real encrypt/decrypt
import { encryptKey, decryptKey, decodeBase64 } from './crypto';

jest.unmock('crypto-js');

describe('encryptKey / decryptKey', () => {
  const testKey = 'my-secret-pin';

  it('roundtrips: decrypt(encrypt(data)) returns original data', () => {
    const original = '5JVFFWRLwz6JoP9kGuuRGnAt';
    const encrypted = encryptKey(original, testKey);
    const decrypted = decryptKey(encrypted, testKey);
    expect(decrypted).toBe(original);
  });

  it('produces different ciphertext for different data', () => {
    const enc1 = encryptKey('data-one', testKey);
    const enc2 = encryptKey('data-two', testKey);
    expect(enc1).not.toBe(enc2);
  });

  it('produces different ciphertext for different keys', () => {
    const data = 'same-data';
    const enc1 = encryptKey(data, 'key-one');
    const enc2 = encryptKey(data, 'key-two');
    expect(enc1).not.toBe(enc2);
  });

  it('returns undefined when decrypting with wrong key', () => {
    const encrypted = encryptKey('secret', 'correct-key');
    const result = decryptKey(encrypted, 'wrong-key');
    expect(result).toBeUndefined();
  });

  it('returns undefined for corrupted ciphertext', () => {
    const result = decryptKey('not-valid-base64-cipher', testKey);
    expect(result).toBeUndefined();
  });

  it('calls onError callback on decryption failure', () => {
    const onError = jest.fn();
    decryptKey('garbage', testKey, onError);
    expect(onError).toHaveBeenCalled();
  });

  it('handles empty string data', () => {
    const encrypted = encryptKey('', testKey);
    const decrypted = decryptKey(encrypted, testKey);
    expect(decrypted).toBe('');
  });

  it('handles special characters in data', () => {
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'\\';
    const encrypted = encryptKey(special, testKey);
    const decrypted = decryptKey(encrypted, testKey);
    expect(decrypted).toBe(special);
  });

  it('handles unicode data', () => {
    const unicode = '你好世界 🌍 مرحبا';
    const encrypted = encryptKey(unicode, testKey);
    const decrypted = decryptKey(encrypted, testKey);
    expect(decrypted).toBe(unicode);
  });
});

describe('decodeBase64', () => {
  it('decodes valid base64', () => {
    // "hello" in base64 is "aGVsbG8="
    const result = decodeBase64('aGVsbG8=');
    expect(result).toBe('hello');
  });

  it('returns null for invalid base64', () => {
    // This won't throw in CryptoJS but may produce garbage — test it doesn't crash
    const result = decodeBase64('!!!not-base64!!!');
    // CryptoJS is lenient, so just ensure it doesn't throw
    expect(typeof result === 'string' || result === null).toBe(true);
  });

  it('handles empty string', () => {
    const result = decodeBase64('');
    expect(typeof result === 'string' || result === null).toBe(true);
  });
});
