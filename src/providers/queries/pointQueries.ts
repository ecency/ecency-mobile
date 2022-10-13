import { useMutation } from "@tanstack/react-query"
import { EPointActivityIds } from "../ecency/ecency.types";
import { userActivity } from "../ecency/ePoint"



interface UserActivityVars {
    localId: string;
    pointsTy: EPointActivityIds;
    blockNum?: string;
    transactionId?: string;
}



export const useUserActivityMutation = () => {

    const _mutationFn = async ({ pointsTy, blockNum, transactionId }: UserActivityVars) => {
        await userActivity(pointsTy, transactionId, blockNum)
        return true;
    }

    return useMutation<boolean, Error, UserActivityVars>(_mutationFn, {
        retry: 2,
        onSuccess: (data, vars) => {
            console.log("successfully logged activity", data, vars)
            //remove entry from redux
        },
        onError: (error, vars) => {
            console.log("failed to log activity", error, vars)
            //add entry in redux
        }
    })
}