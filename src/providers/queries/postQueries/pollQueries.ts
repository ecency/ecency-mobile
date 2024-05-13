import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QUERIES from "../queryKeys";
import { castPollVote, getPollData } from "../../polls/polls";
import { PostMetadata } from "../../hive/hive.types";
import { useMemo, useState } from "react";
import { Poll, PollChoice } from "../../polls/polls.types";
import { useAppSelector } from "../../../hooks";
import parseToken from "../../../utils/parseToken";
import { vestsToHp } from "../../../utils/conversions";



/** hook used to return post poll */
export const useGetPollQuery = (_author?: string, _permlink?: string, metadata?: PostMetadata) => {

    const [author, setAuthor] = useState(_author);
    const [permlink, setPermlink] = useState(_permlink);

    // post process initial post if available
    const _initialPollData = useMemo(() => {

        //TODO: convert metadata to Poll data;

        return null;
    }, [metadata]);

    const query = useQuery(
        [QUERIES.POST.GET_POLL, author, permlink],
        async () => {
            if (!author || !permlink) {
                return null;
            }

            try {
                const pollData = await getPollData(author, permlink);
                if (!pollData) {
                    new Error('Poll data unavailable');
                }

                return pollData
            } catch (err) {
                console.warn('Failed to get post', err);
                throw err;
            }
        },
        {
            initialData: _initialPollData,
            cacheTime: 30 * 60 * 1000, // keeps cache for 30 minutes
        },
    );

    //TODO: use injectPollVoteCache here for simplifity and code reuseability
    // const data = useInjectVotesCache(query.data);

    return {
        ...query,
        //   data, //TODO: return cache inserted poll data
        setAuthor,
        setPermlink,
    };
};




export function useVotePollMutation(poll: Poll | null) {
    // const { activeUser } = useMappedStore();
    const queryClient = useQueryClient()
    const currentAccount = useAppSelector(state => state.account.currentAccount);
    const pinHash = useAppSelector(state => state.application.pin);
    const globalProps = useAppSelector(state => state.account.globalProps)

    // const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["sign-poll-vote", poll?.author, poll?.permlink],
        mutationFn: async ({ choiceNum }: { choiceNum: number }) => {

            if (!poll || !currentAccount) {
                throw new Error("Failed to register vote")
            }

            if (typeof choiceNum !== "number") {
                throw new Error("Invalid vote")
            }

            await castPollVote(poll.poll_trx_id, choiceNum, currentAccount, pinHash)

            return { choiceNum };
        },
        onMutate: ({ choiceNum }) => {
            queryClient.setQueryData<ReturnType<typeof useGetPollQuery>["data"]>(
                [QUERIES.POST.GET_POLL, poll?.author, poll?.permlink],
                (data) => {
                    if (!data || !choiceNum) {
                        return data;
                    }

                    //TOOD: use injectPollVoteCache here for simplifity and code reuseability
                    const userHp = Math.round(vestsToHp(parseToken(currentAccount.vesting_shares), globalProps.hivePerMVests) * 1000) / 1000;

                    const existingVote = data.poll_voters?.find((pv) => pv.name === currentAccount!!.username);
                    const previousUserChoice = data.poll_choices?.find(
                        (pc) => existingVote?.choice_num === pc.choice_num
                    );
                    const choice = data.poll_choices?.find((pc) => pc.choice_num === choiceNum)!!;


                    const notTouchedChoices = data.poll_choices?.filter(
                        (pc) => ![previousUserChoice?.choice_num, choice?.choice_num].includes(pc.choice_num)
                    );
                    const otherVoters =
                        data.poll_voters?.filter((pv) => pv.name !== currentAccount!!.username) ?? [];


                    let poll_choices = data.poll_choices;
                    if (previousUserChoice?.choice_num !== choice.choice_num) {

                        poll_choices = [
                            ...notTouchedChoices,
                            previousUserChoice
                                ? {
                                    ...previousUserChoice,
                                    votes: {
                                        total_votes: (previousUserChoice?.votes?.total_votes ?? 0) - 1,
                                        hive_hp: (previousUserChoice?.votes?.hive_hp ?? 0) - userHp,
                                        hive_hp_incl_proxied:(previousUserChoice?.votes?.hive_hp ?? 0) - userHp
                                    }
                                }
                                : undefined,
                            {
                                ...choice,
                                votes: {
                                    total_votes: (choice?.votes?.total_votes ?? 0) + 1,
                                    hive_hp: (choice?.votes?.hive_hp ?? 0) + userHp,
                                    hive_hp_incl_proxied:(choice?.votes?.hive_hp ?? 0) + userHp
                                }
                            }
                        ].filter((el) => !!el).sort(((a, b) => a?.choice_num < b?.choice_num ? -1 : 1)) as PollChoice[]
                    }


                    return {
                        ...data,
                        poll_choices,
                        poll_voters: [
                            ...otherVoters,
                            { name: currentAccount?.username, choice_num: choiceNum }
                        ]
                    } as ReturnType<typeof useGetPollQuery>["data"];
                }
            )
        },

        onSuccess: (resp) => {
            //TODO: update cache here
        },
        onError: (err) => {
            //TOOD: reverse mutation here
        }


    });
}

//TODO: use to create, update and remove poll vote entry from votes data
const injectPollVoteCache = () => {
    // queryClient.setQueryData<ReturnType<typeof useGetPollDetailsQuery>["data"]>(
    //   [QueryIdentifiers.POLL_DETAILS, poll?.author, poll?.permlink],
    //   (data) => {
    //     if (!data || !resp) {
    //       return data;
    //     }

    //     const existingVote = data.poll_voters?.find((pv) => pv.name === activeUser!!.username);
    //     const previousUserChoice = data.poll_choices?.find(
    //       (pc) => existingVote?.choice_num === pc.choice_num
    //     );
    //     const choice = data.poll_choices?.find((pc) => pc.choice_num === resp.choiceNum)!!;

    //     const notTouchedChoices = data.poll_choices?.filter(
    //       (pc) => ![previousUserChoice?.choice_num, choice?.choice_num].includes(pc.choice_num)
    //     );
    //     const otherVoters =
    //       data.poll_voters?.filter((pv) => pv.name !== activeUser!!.username) ?? [];

    //     return {
    //       ...data,
    //       poll_choices: [
    //         ...notTouchedChoices,
    //         previousUserChoice
    //           ? {
    //               ...previousUserChoice,
    //               votes: {
    //                 total_votes: (previousUserChoice?.votes?.total_votes ?? 0) - 1
    //               }
    //             }
    //           : undefined,
    //         {
    //           ...choice,
    //           votes: {
    //             total_votes: (choice?.votes?.total_votes ?? 0) + 1
    //           }
    //         }
    //       ].filter((el) => !!el),
    //       poll_voters: [
    //         ...otherVoters,
    //         { name: activeUser?.username, choice_num: resp.choiceNum }
    //       ]
    //     } as ReturnType<typeof useGetPollDetailsQuery>["data"];
    //   }
    // )
}
