import { useMutation } from "@tanstack/react-query"
import { useAppSelector, useAppDispatch } from '../../hooks';
import { deletePointActivityCache, updatePointActivityCache } from "../../redux/actions/cacheActions";
import { generateRndStr } from "../../utils/editor";
import { PointActivityIds } from "../ecency/ecency.types";
import { userActivity } from "../ecency/ePoint"



interface UserActivityMutationVars {
    pointsTy: PointActivityIds;
    blockNum?: string;
    transactionId?: string;
    cacheId?:string
}


export const useUserActivityMutation = () => {
    const dispatch = useAppDispatch();
    const currentAccount = useAppSelector(state=>state.account.currentAccount);


    const _mutationFn = async ({ pointsTy, blockNum, transactionId }: UserActivityMutationVars) => {
        throw new Error("failed")
        await userActivity(pointsTy, transactionId, blockNum)
        return true;
    }

    const mutation = useMutation<boolean, Error, UserActivityMutationVars>(_mutationFn, {
        retry: 2,
        onSuccess: (data, vars) => {
            console.log("successfully logged activity", data, vars)
            //remove entry from redux
            if(vars.cacheId){
                console.log("must remove from redux")
                dispatch(deletePointActivityCache(vars.cacheId))
            }
        },
        onError: (error, vars) => {
            console.log("failed to log activity", error, vars)
            //add entry in redux
            if(!vars.cacheId && currentAccount){
                console.log("must add to from redux")
                const cacheId = generateRndStr();
                const { username } = currentAccount;
                dispatch(updatePointActivityCache(cacheId, {...vars, username}))
            }
        }
    })

    const mutatePendingActivities = () => {
        //read pending activities from redux
    
    }


    return {
        ...mutation,
        mutatePendingActivities,
    }
}