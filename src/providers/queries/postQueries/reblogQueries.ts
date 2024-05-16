import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QUERIES from "../queryKeys";
import { castPollVote } from "../../polls/polls";
import { useEffect, useState } from "react";
import { Poll, PollChoice } from "../../polls/polls.types";
import { useAppSelector } from "../../../hooks";
import parseToken from "../../../utils/parseToken";
import { vestsToHp } from "../../../utils/conversions";
import { updatePollVoteCache } from "../../../redux/actions/cacheActions";
import { useDispatch } from "react-redux";
import { CacheStatus, PollVoteCache } from "../../../redux/reducers/cacheReducer";
import { setRcOffer, toastNotification } from "../../../redux/actions/uiAction";
import { useIntl } from "react-intl";
import { getPostReblogs, reblog } from "../../hive/dhive";
import { get } from 'lodash';
import { PointActivityIds } from "../../ecency/ecency.types";
import { useUserActivityMutation } from "../pointQueries";



/** hook used to return post poll */
export const useGetReblogsQuery = (author: string, permlink: string) => {


    const query = useQuery<string[]>(
        [QUERIES.POST.GET_REBLOGS, author, permlink],
        async () => {
            if (!author || !permlink) {
                return null;
            }

            try {
                const reblogs = await getPostReblogs(author, permlink);
                if (!reblogs) {
                    new Error('Reblog data unavailable');
                }

                return reblogs
            } catch (err) {
                console.warn('Failed to get post', err);
                return []
            }
        },
        {
            initialData: [],
            cacheTime: 30 * 60 * 1000, // keeps cache for 30 minutes
        },
    );

    return query;
};




export function useReblogMutation(author: string, permlink: string) {
    // const { activeUser } = useMappedStore();
    const intl = useIntl();
    const dispatch = useDispatch();
    const queryClient = useQueryClient()
    const currentAccount = useAppSelector(state => state.account.currentAccount);
    const pinHash = useAppSelector(state => state.application.pin);

    const userActivityMutation = useUserActivityMutation();


    return useMutation({
        mutationKey: [QUERIES.POST.REBLOG_POST],
        mutationFn: async () => {

            if (!author || !permlink || !currentAccount) {
                throw new Error("Not enough data to reblog post")
            }

            const resp = await reblog(currentAccount, pinHash, author, permlink)

            // track user activity points ty=130
            userActivityMutation.mutate({
                pointsTy: PointActivityIds.REBLOG,
                transactionId: resp.id,

            });

            dispatch(
                toastNotification(
                    intl.formatMessage({
                        id: 'alert.success_rebloged',
                    }),
                ),
            );

            return resp;

        },
        retry: 3,

        onSuccess: (resp) => {
            console.log("reblog response", resp);
            //update poll cache here
            queryClient.setQueryData<ReturnType<typeof useGetReblogsQuery>["data"]>(
                [QUERIES.POST.GET_REBLOGS, author, permlink],
                (data) => {
                    if (!data || !resp) {
                        return data;
                    }

                    if (!data.includes(currentAccount.username)) {
                        data.splice(0, 0, currentAccount.username);
                    }

                    return [...data] as ReturnType<typeof useGetReblogsQuery>["data"];
                }
            )
        },
        onError: (error) => {
            if (String(get(error, 'jse_shortmsg', '')).indexOf('has already reblogged') > -1) {
                dispatch(
                    toastNotification(
                        intl.formatMessage({
                            id: 'alert.already_rebloged',
                        }),
                    ),
                );
            } else {
                if (error && error.jse_shortmsg.split(': ')[1].includes('wait to transact')) {
                    // when RC is not enough, offer boosting account
                    dispatch(setRcOffer(true));
                } else {
                    // when other errors
                    dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
                }
            }
        }


    });
}


