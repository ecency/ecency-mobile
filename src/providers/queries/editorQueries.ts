import { useQuery } from "@tanstack/react-query"
import { useIntl } from "react-intl"
import { useAppDispatch } from "../../hooks"
import { toastNotification } from "../../redux/actions/uiAction"
import { getFragments } from "../ecency/ecency"
import QUERIES from "./queryKeys"



export const useSnippetsQuery = () => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    return useQuery([QUERIES.SNIPPETS.GET], getFragments, {
        onError:()=>{
            dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
        }
    })
}