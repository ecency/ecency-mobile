import { useQuery } from "@tanstack/react-query"
import QUERIES from "./queryKeys"
import { useSelector } from "react-redux"
import { getProposalsVoted } from "../../providers/hive/dhive";


export const useProposalVotedQuery = (proposalId:number) => {

    const currentAccount = useSelector(state => state.account.currentAccount);

    const _getProposalVoteStatus = async () => {
        const votedProposals = await getProposalsVoted(currentAccount.username);
        const isVoted =  votedProposals.some(item => item.proposal.proposal_id === proposalId)
        
        console.log('is proposal voted', isVoted);
        return isVoted;
    }

    const query = useQuery(
        [QUERIES.PROPOSALS.GET_VOTES, currentAccount.name, proposalId],
        _getProposalVoteStatus,
        {initialData:true}
    )


    return query;

}