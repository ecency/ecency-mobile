import { useQuery } from "@tanstack/react-query";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { toastNotification } from "../../../redux/actions/uiAction";
import { MediaItem } from "../../ecency/ecency.types";
import { getAllVideoStatuses } from "../../speak/speak";
import QUERIES from "../queryKeys";
import { extract3SpeakIds } from "../../../utils/editor";
import { useRef } from "react";
import { ThreeSpeakVideo } from "../../speak/speak.types";

/**
 * fetches and caches speak video uploads
 * @returns query instance with data as array of videos as MediaItem[]
 */
export const useVideoUploadsQuery = () => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
  
    const currentAccount = useAppSelector((state) => state.account.currentAccount);
    const pinHash = useAppSelector((state) => state.application.pin);
  
    const _fetchVideoUploads = async () => getAllVideoStatuses(currentAccount, pinHash);
  
    // TOOD: filter cache data for post edits to only show already published videos
  
    return useQuery<MediaItem[]>([QUERIES.MEDIA.GET_VIDEOS], _fetchVideoUploads, {
      initialData: [],
      onError: () => {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      },
    });
  };


export const useSpeakContentBuilder = () => {

    const videoUploads = useVideoUploadsQuery();
    const videoPublishMetaRef = useRef<ThreeSpeakVideo|null>(null);

    const build = (body:string) => {
        let _newBody = body;
        const _ids = extract3SpeakIds({body});

        _ids.forEach((id) => {
            const mediaItem:MediaItem|undefined = videoUploads.data.find((item) => item._id === id);
            if(mediaItem){

                //TODO: check if video is unpublished, set unpublish video meta
                

                //replace 3speak with actual data
                const _toReplaceStr = `[3speak](${id})`;
                const _replacement = `<center>[![](${mediaItem.thumbUrl})](${mediaItem.url})</center>`
                _newBody = _newBody.replace(_toReplaceStr, _replacement)
               
            }
        })

        return _newBody;
    }

    return {
        build,
        videoPublishMeta:videoPublishMetaRef.current
    }
}