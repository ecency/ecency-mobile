import { MediaItem } from "../ecency/ecency.types"


export const convertVideoUpload = (videoItem) => {
    return {
        _id:videoItem._id,
        url:videoItem._id, //TOOD: add a better url or change prop
        thumbUrl:videoItem.thumbUrl,
        created:videoItem.created,
        timestamp:0
    } as MediaItem
}