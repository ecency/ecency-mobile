import axios from 'axios';
import hs from 'hivesigner';
import { Image, Video } from 'react-native-image-crop-picker';
import { Upload } from 'react-native-tus-client';
import { Platform } from 'react-native';
import { getDigitPinCode } from '../hive/dhive';
import { ThreeSpeakVideo } from './speak.types';
import { decryptKey } from '../../utils/crypto';
import { convertVideoUpload } from './converters';
import { BASE_URL_SPEAK_STUDIO, PATH_API, PATH_LOGIN, PATH_MOBILE } from './constants';

const tusEndPoint = 'https://uploads.3speak.tv/files/';

const speakApi = axios.create({
  baseURL: `${BASE_URL_SPEAK_STUDIO}/${PATH_MOBILE}`,
});

export const threespeakAuth = async (currentAccount: any, pinHash: string) => {
  try {
    const response = await speakApi.get(
      `${PATH_LOGIN}?username=${currentAccount.username}&hivesigner=true`,
      {
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const memo_string = response.data.memo;
    const memoDecoded = await getDecodedMemo(currentAccount.local, pinHash, memo_string);

    return memoDecoded.replace('#', '');
  } catch (err) {
    console.error(new Error('[3Speak auth] Failed to login'));
    throw err;
  }
};

export const uploadVideoInfo = async (
  currentAccount: any,
  pinHash: string,
  oFilename: string,
  fileSize: number,
  videoId: string,
  thumbnailId: string,
  duration: string,
) => {
  const token = await threespeakAuth(currentAccount, pinHash);
  try {
    const { data } = await speakApi.post<ThreeSpeakVideo>(
      `${PATH_API}/upload_info?app=ecency`,
      {
        filename: videoId,
        oFilename,
        size: fileSize,
        duration,
        thumbnail: thumbnailId,
        isReel: false,
        owner: currentAccount.username,
      },
      {
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const getAllVideoStatuses = async (currentAccount: any, pinHash: string) => {
  const token = await threespeakAuth(currentAccount, pinHash);
  try {
    const response = await speakApi.get<ThreeSpeakVideo[]>(`${PATH_API}/my-videos`, {
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const mediaItems = response.data.map(convertVideoUpload);

    return mediaItems;
  } catch (err) {
    console.error(new Error('[3Speak video] Failed to get videos'));

    throw err;
  }
};

// TOOD: use api during post publishing
export const updateSpeakVideoInfo = async (
  currentAccount: any,
  pinHash: string,
  postBody: string,
  videoId: string,
  title: string,
  tags: string[],
  isNsfwC?: boolean,
) => {
  const token = await threespeakAuth(currentAccount, pinHash);

  const data = {
    videoId,
    title,
    description: postBody,
    isNsfwContent: isNsfwC || false,
    tags_v2: tags,
  };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  try {
    await speakApi.post(`${PATH_API}/update_info`, data, { headers });
  } catch (e) {
    console.error(e);
  }
};

export const markAsPublished = async (currentAccount: any, pinHash: string, videoId: string) => {
  const token = await threespeakAuth(currentAccount, pinHash);
  const data = {
    videoId,
  };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  speakApi
    .post(`${PATH_API}/my-videos/iPublished`, data, { headers })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

// 'https://studio.3speak.tv/mobile/api/video/${permlink}/delete

export const deleteVideo = async (currentAccount: any, pinHash: string, permlink: string) => {
  const token = await threespeakAuth(currentAccount, pinHash);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  speakApi
    .get(`${PATH_API}/video/${permlink}/delete`, {headers})
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};


export const uploadFile = (media: Video | Image, onProgress?:(progress:number)=>void) => {
  return new Promise((resolve, reject) => {
    try {
      const _path = Platform.select({
        ios: media.path,
        android: media.path.replace('file://', ''),
      });

      if (!_path) {
        throw new Error('failed to create apporpriate path');
      }

      const upload = new Upload(_path, {
        endpoint: tusEndPoint, // use your tus server endpoint instead
        metadata: {
          filename: media.filename || media.path.split('/').pop(),
          filetype: media.mime,
        },
        onError: (error) => console.log('error', error),
        onSuccess: () => {
          console.log('Upload completed. File url:', upload.url);
          const _videoId = upload.url.replace(tusEndPoint, '');
          resolve(_videoId);
        },

        onProgress: (uploaded, total) => {
          if(onProgress){
            onProgress((uploaded / total));
          }
        },
      });

      upload.start();
    } catch (error) {
      console.warn('Image upload failed', error);
      reject(error);
    }
  });
};

const getDecodedMemo = async (local, pinHash, encryptedMemo) => {
  try {
    const digitPinCode = getDigitPinCode(pinHash);
    const token = decryptKey(local.accessToken, digitPinCode);

    const client = new hs.Client({
      accessToken: token,
    });

    const { memoDecoded } = await client.decode(encryptedMemo);

    if (!memoDecoded) {
      throw new Error('Decode failed');
    }

    return memoDecoded;
  } catch (err) {
    console.warn('Failed to decode memo key', err);
  }
};
