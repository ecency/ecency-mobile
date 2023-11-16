import axios from 'axios';
import hs from 'hivesigner';
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
  videoUrl: string,
  thumbnailUrl: string,
  username: string,
  duration: string,
) => {
  const token = await threespeakAuth(currentAccount, pinHash);
  try {
    const { data } = await axios.post<ThreeSpeakVideo>(
      `${PATH_API}/upload_info?app=ecency`,
      {
        filename: videoUrl,
        oFilename,
        size: fileSize,
        duration,
        thumbnail: thumbnailUrl,
        isReel: false,
        owner: username,
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

export const updateSpeakVideoInfo = async (
  currentAccount: any,
  pinHash: string,
  postBody: string,
  videoId: string,
  title: string,
  tags: string[],
  isNsfwC: boolean,
) => {
  const token = await threespeakAuth(currentAccount, pinHash);

  const data = {
    videoId,
    title,
    description: postBody,
    isNsfwContent: isNsfwC,
    tags_v2: tags,
  };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  try {
    await axios.post(`${PATH_API}/update_info`, data, { headers });
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

  axios
    .post(`${PATH_API}/my-videos/iPublished`, data, { headers })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

export const uploadVideo = async (media, onUploadProgress) => {
  try {
    const file = {
      uri: media.path,
      type: media.mime,
      name: media.filename || `img_${Math.random()}.mp4`,
      size: media.size,
    };

    const fData = new FormData();
    fData.append('file', file);

    const res = await axios.post(tusEndPoint, fData, {
      onUploadProgress,
    });
    if (!res || !res.data) {
      throw new Error('Returning response missing media data');
    }
    return res.data;
  } catch (error) {
    console.warn('Image upload failed', error);
    throw error;
  }
};

//   export const uploadFile = async (
//     file: File,
//     type: string,
//     progressCallback: (percentage: number) => void
//   ) => {
//     return new Promise<{
//       fileUrl: string;
//       fileName: string;
//       fileSize: number;
//     }>((resolve, reject) => {
//       let vPercentage = 0;
//       let tPercentage = 0;

//       const upload: any = new tus.Upload(file, {
//         endpoint: tusEndPoint,
//         retryDelays: [0, 3000, 5000, 10000, 20000],
//         metadata: {
//           filename: file.name,
//           filetype: file.type
//         },
//         onError: function (error: Error) {
//           reject(error);
//         },
//         onProgress: function (bytesUploaded: number, bytesTotal: number) {
//           if (type === "video") {
//             vPercentage = Number(((bytesUploaded / bytesTotal) * 100).toFixed(2));
//             progressCallback(vPercentage);
//           } else {
//             tPercentage = Number(((bytesUploaded / bytesTotal) * 100).toFixed(2));
//             progressCallback(tPercentage);
//           }
//         },
//         onSuccess: function () {
//           let fileUrl = upload?.url.replace(tusEndPoint, "");
//           const result = {
//             fileUrl,
//             fileName: upload.file?.name || "",
//             fileSize: upload.file?.size || 0
//           };
//           resolve(result);
//         }
//       });
//       upload.start();
//     });
//   };

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
