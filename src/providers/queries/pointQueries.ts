import { useMutation } from "@tanstack/react-query"
import { PointActivityIds } from "../ecency/ecency.types";
import { userActivity } from "../ecency/ePoint"



interface UserActivityMutationVars {
    pointsTy: PointActivityIds;
    blockNum?: string;
    transactionId?: string;
    cacheId?:string
}


export const useUserActivityMutation = () => {

    const _mutationFn = async ({ pointsTy, blockNum, transactionId }: UserActivityMutationVars) => {
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
            }
        },
        onError: (error, vars) => {
            console.log("failed to log activity", error, vars)
            //add entry in redux
            if(!vars.cacheId){
                console.log("must add to from redux")
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