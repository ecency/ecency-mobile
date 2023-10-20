import { MediaItem } from "../ecency/ecency.types"
import { BASE_URL_SPEAK_WATCH } from "./constants"


export const convertVideoUpload = (data) => {
    return {
        _id:data._id,
        url:`${BASE_URL_SPEAK_WATCH}?v=${data.owner}/${data.permlink}`,
        thumbUrl:data.thumbUrl,
        created:data.created,
        timestamp:0
    } as MediaItem
}