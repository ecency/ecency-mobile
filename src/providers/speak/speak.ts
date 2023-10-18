import * as tus from "tus-js-client";
import axios from "axios";
import { getDecodedMemo } from "../../helper/hive-signer";
import { ThreeSpeakVideo } from "./types";

const studioEndPoint = "https://studio.3speak.tv";
const tusEndPoint = "https://uploads.3speak.tv/files/";
const client = axios.create({});

export const threespeakAuth = async (username: string) => {
    try {
      let response = await client.get(
        `${studioEndPoint}/mobile/login?username=${username}&hivesigner=true`,
        {
          withCredentials: false,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      const memo_string = response.data.memo;
      let { memoDecoded } = await getDecodedMemo(username, memo_string);
  
      memoDecoded = memoDecoded.replace("#", "");
      return memoDecoded;
    } catch (err) {
      console.error(new Error("[3Speak auth] Failed to login"));
      throw err;
    }
  };
  
  export const getTokenValidated = async (jwt: string, username: string) => {
    try {
      let response = await client.get(
        `${studioEndPoint}/mobile/login?username=${username}&access_token=${jwt}`,
        {
          withCredentials: false,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      return response.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
  
  export const uploadVideoInfo = async (
    oFilename: string,
    fileSize: number,
    videoUrl: string,
    thumbnailUrl: string,
    username: string,
    duration: string
  ) => {
    const token = await threespeakAuth(username);
    try {
      const { data } = await axios.post<ThreeSpeakVideo>(
        `${studioEndPoint}/mobile/api/upload_info?app=ecency`,
        {
          filename: videoUrl,
          oFilename: oFilename,
          size: fileSize,
          duration,
          thumbnail: thumbnailUrl,
          isReel: false,
          owner: username
        },
        {
          withCredentials: false,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
      return data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
  
  export const getAllVideoStatuses = async (username: string) => {
    const token = await threespeakAuth(username);
    try {
      let response = await client.get<ThreeSpeakVideo[]>(`${studioEndPoint}/mobile/api/my-videos`, {
        withCredentials: false,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (err) {
      console.error(new Error("[3Speak video] Failed to get videos"));
  
      throw err;
    }
  };
  
  export const updateSpeakVideoInfo = async (
    username: string,
    postBody: string,
    videoId: string,
    title: string,
    tags: string[],
    isNsfwC: boolean
  ) => {
    const token = await threespeakAuth(username);
  
    const data = {
      videoId: videoId,
      title: title,
      description: postBody,
      isNsfwContent: isNsfwC,
      tags_v2: tags
    };
  
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  
    try {
      await axios.post(`${studioEndPoint}/mobile/api/update_info`, data, { headers });
    } catch (e) {
      console.error(e);
    }
  };
  
  export const markAsPublished = async (username: string, videoId: string) => {
    const token = await threespeakAuth(username);
    const data = {
      videoId
    };
  
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  
    axios
      .post(`${studioEndPoint}/mobile/api/my-videos/iPublished`, data, { headers })
      .then((response) => {})
      .catch((error) => {
        console.error("Error:", error);
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
        onUploadProgress
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
  