import axios from 'axios';
import { Operation, PrivateKey } from '@esteemapp/dhive';
import { Client as hsClient } from 'hivesigner';
import bugsnagInstance from '../../config/bugsnag';
import { Poll } from './polls.types';
import { convertPoll } from './converters';
import { getActiveKey, getDigitPinCode, isHsClientSupported, sendHiveOperations } from '../hive/dhive';
import AUTH_TYPE from '../../constants/authType';
import { decryptKey } from '../../utils/crypto';

/**
 *
 * swapper importable api url
 * https://polls-beta.hivehub.dev/
 *
 * hive polls docs reference:
 * https://gitlab.com/peakd/hive-open-polls
 *
 */

const POLLS_BASE_URL = 'https://polls.hivehub.dev/';

const PATH_RPC = 'rpc';
const PATH_POLL = 'poll';

const pollsApi = axios.create({
  baseURL: POLLS_BASE_URL,
});

const executePollAction = (id: string, json: any, currentAccount: any, pinHash: string) => {
  const username = currentAccount.name;
  const pin = getDigitPinCode(pinHash);
  const key = getActiveKey(currentAccount.local, pin);

  const op = {
    id,
    json: JSON.stringify(json),
    required_auths: [],
    required_posting_auths: [username],
  };
  const opArray: Operation[] = [['custom_json', op]];

  //TODO: check if this need to accomodate HIVE_AUTH;
  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(currentAccount.local.accessToken, pin);
    const api = new hsClient({
      accessToken: token,
    });

    return api.broadcast(opArray).then((resp) => resp.result);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    return sendHiveOperations(opArray, privateKey);
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const getPollData = async (author: string, permlink: string): Promise<Poll> => {
  try {
    if (!author || !permlink) {
      throw new Error('author and permlink are requied for fetching polls data');
    }

    // prefix (eq.) is a requirement from api implementation
    const params = {
      author: `eq.${author}`,
      permlink: `eq.${permlink}`,
    };

    const res = await pollsApi.get(`/${PATH_RPC}/${PATH_POLL}`, { params });

    console.log('poll data fetcehd', res.data);
    if (!res.data || !res.data[0]) {
      throw new Error('No poll data found!');
    }

    const data = convertPoll(res.data[0]);

    if (!data) {
      throw new Error('Failed to parse poll resposne data');
    }

    return data;
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};

export const castPollVote = async (
  postId: string,
  choices: number[],
  currentAccount: any,
  pinHash: string,
) => {
  try {
    if (!postId || !currentAccount) {
      throw new Error('Failed to register vote');
    }

    if (!choices || !choices.length) {
      throw new Error('Invalid vote');
    }

    await executePollAction(
      'polls',
      {
        poll: postId,
        action: 'vote',
        choices,
      },
      currentAccount,
      pinHash,
    );

    return true;
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};
