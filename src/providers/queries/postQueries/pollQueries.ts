import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QUERIES from "../queryKeys";
import { getPollData } from "../../polls/polls";
import { PostMetadata } from "../../hive/hive.types";
import { useMemo, useState } from "react";
import { getActiveKey, getDigitPinCode, sendHiveOperations } from "../../hive/dhive";
import { Operation, PrivateKey } from "@esteemapp/dhive";
import { Poll } from "../../polls/polls.types";
import { useAppSelector } from "../../../hooks";


const executePollAction = (id: string, json: any, currentAccount: any, pinHash: string) => {
    const pin = getDigitPinCode(pinHash);
    const key = getActiveKey(currentAccount.local, pin);
    const username = currentAccount.name;

    if (key) {
        const privateKey = PrivateKey.fromString(key);

        const op = {
            id,
            json: JSON.stringify(json),
            required_auths: [username],
            required_posting_auths: [],
        };
        const opArray: Operation[] = [['custom_json', op]];
        return sendHiveOperations(opArray, privateKey);
    }

    return Promise.reject(
        new Error('Check private key permission! Required private active key or above.'),
    );
};



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

    //TODO: inject poll cache here.
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

            await executePollAction("polls", {
                poll: poll.poll_trx_id,
                action: "vote",
                choice: choiceNum
            }, currentAccount, pinHash);

            return { choiceNum };
        },
        onMutate: ({ choiceNum }) => {


            queryClient.setQueryData<ReturnType<typeof useGetPollQuery>["data"]>(
                [QUERIES.POST.GET_POLL, poll?.author, poll?.permlink],
                (data) => {
                    if (!data || !choiceNum) {
                        return data;
                    }

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
                    if(previousUserChoice?.choice_num !== choice.choice_num){
                        poll_choices = [
                            ...notTouchedChoices,
                            previousUserChoice
                                ? {
                                    ...previousUserChoice,
                                    votes: {
                                        total_votes: (previousUserChoice?.votes?.total_votes ?? 0) - 1
                                    }
                                }
                                : undefined,
                            {
                                ...choice,
                                votes: {
                                    total_votes: (choice?.votes?.total_votes ?? 0) + 1
                                }
                            }
                        ].filter((el) => !!el).sort(((a, b) => a?.choice_num < b?.choice_num ? -1 : 1))
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
        }

        //   onSuccess: (resp) =>
        //     queryClient.setQueryData<ReturnType<typeof useGetPollDetailsQuery>["data"]>(
        //       [QueryIdentifiers.POLL_DETAILS, poll?.author, poll?.permlink],
        //       (data) => {
        //         if (!data || !resp) {
        //           return data;
        //         }

        //         const existingVote = data.poll_voters?.find((pv) => pv.name === activeUser!!.username);
        //         const previousUserChoice = data.poll_choices?.find(
        //           (pc) => existingVote?.choice_num === pc.choice_num
        //         );
        //         const choice = data.poll_choices?.find((pc) => pc.choice_num === resp.choiceNum)!!;

        //         const notTouchedChoices = data.poll_choices?.filter(
        //           (pc) => ![previousUserChoice?.choice_num, choice?.choice_num].includes(pc.choice_num)
        //         );
        //         const otherVoters =
        //           data.poll_voters?.filter((pv) => pv.name !== activeUser!!.username) ?? [];

        //         return {
        //           ...data,
        //           poll_choices: [
        //             ...notTouchedChoices,
        //             previousUserChoice
        //               ? {
        //                   ...previousUserChoice,
        //                   votes: {
        //                     total_votes: (previousUserChoice?.votes?.total_votes ?? 0) - 1
        //                   }
        //                 }
        //               : undefined,
        //             {
        //               ...choice,
        //               votes: {
        //                 total_votes: (choice?.votes?.total_votes ?? 0) + 1
        //               }
        //             }
        //           ].filter((el) => !!el),
        //           poll_voters: [
        //             ...otherVoters,
        //             { name: activeUser?.username, choice_num: resp.choiceNum }
        //           ]
        //         } as ReturnType<typeof useGetPollDetailsQuery>["data"];
        //       }
        //     )
    });
}
