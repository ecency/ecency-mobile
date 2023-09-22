import { useDispatch } from "react-redux";
import { useAppSelector } from "../../hooks";
import { postComment } from "../../providers/hive/dhive";
import { extractMetadata, generateReplyPermlink, makeJsonMetadata } from "../../utils/editor";
import { Alert } from "react-native";
import { updateCommentCache } from "../../redux/actions/cacheActions";
import { toastNotification } from "../../redux/actions/uiAction";
import { useIntl } from "react-intl";
import { useState } from "react";
import { useUserActivityMutation, wavesQueries } from "../../providers/queries";
import { PointActivityIds } from "../../providers/ecency/ecency.types";
import { usePublishWaveMutation } from "../../providers/queries/postQueries/wavesQueries";


export const usePostSubmitter = () => {

    const dispatch = useDispatch();
    const intl = useIntl();

    const pusblishWaveMutation = usePublishWaveMutation();


    const currentAccount = useAppSelector((state) => state.account.currentAccount);
    const pinCode = useAppSelector(state => state.application.pin);
    const userActivityMutation = useUserActivityMutation();
    const [isSending, setIsSending] = useState(false);


    // handle submit reply
    const _submitReply = async (commentBody: string, parentPost: any, postType: PostTypes) => {
        if (!commentBody) {
            return false ;
        }
        if (isSending) {
            return false;
        }

        if (currentAccount) {
            setIsSending(true);

            const permlink = generateReplyPermlink(parentPost.author);
            const author = currentAccount.name;
            const parentAuthor = parentPost.author;
            const parentPermlink = parentPost.permlink;
            const parentTags = parentPost.json_metadata.tags;
            const category = parentPost.category || '';
            const url = `/${category}/@${parentAuthor}/${parentPermlink}#@${author}/${permlink}`;

            //adding jsonmeta with image ratios here....
            const meta = await extractMetadata({
                body:commentBody,
                fetchRatios:true,
                postType
            })
            const jsonMetadata = makeJsonMetadata(meta, parentTags || ['ecency'])

            console.log(
                currentAccount,
                pinCode,
                parentAuthor,
                parentPermlink,
                permlink,
                commentBody,
                jsonMetadata
            );


            try {
                const response = await postComment(
                    currentAccount,
                    pinCode,
                    parentAuthor,
                    parentPermlink,
                    permlink,
                    commentBody,
                    [],
                    jsonMetadata
                )

                userActivityMutation.mutate({
                    pointsTy: PointActivityIds.COMMENT,
                    transactionId: response.id,
                });
                setIsSending(false);

                dispatch(
                    toastNotification(
                        intl.formatMessage({
                            id: 'alert.success',
                        }),
                    ),
                );

                // add comment cache entry
                const _cacheCommentData =  {
                    author,
                    permlink,
                    url,
                    parent_author: parentAuthor,
                    parent_permlink: parentPermlink,
                    markdownBody: commentBody,
                    json_metadata: jsonMetadata
                }
                
                dispatch(
                    updateCommentCache(
                        `${author}/${permlink}`,
                        _cacheCommentData,
                        {
                            parentTags: parentTags || ['ecency'],
                        },
                    ),
                );

                return _cacheCommentData;


            } catch (error) {
                console.log(error);
                Alert.alert(
                    intl.formatMessage({
                        id: 'alert.something_wrong',
                    }),
                    error.message || JSON.stringify(error),
                );

                setIsSending(false);
                return false;

            }


        }

        return false;
    };



    //feteced lates wafves container and post wave to that container
    const _submitWave = async (body:string) => {

        try {
            const _wavesHost = 'ecency.waves' //TODO: make waves host selection dynamic
            const latestWavesPost = await wavesQueries.fetchLatestWavesContainer(_wavesHost);

            const _cacheCommentData = await _submitReply(body, latestWavesPost, PostTypes.WAVE)

            if(_cacheCommentData){
                pusblishWaveMutation.mutate(_cacheCommentData)
            }

            return _cacheCommentData
        } catch (err) {
            Alert.alert("Fail", err.message)
            return false;
        }
    }



    return {
        submitReply: _submitReply,
        submitWave: _submitWave,
        isSending
    }

}