import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchAndSetCoinsData } from "../../redux/actions/walletActions";
import QUERIES from "./queryKeys";


/** hook used to return user drafts */
export const useGetAssetsQuery = () => {

    const dispatch = useAppDispatch();

    const currentAccount = useAppSelector(state => state.account.currentAccount);

    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(()=>{
        if(isRefreshing){
            query.refetch();
        }
    },[isRefreshing])

    const query = useQuery([QUERIES.WALLET.GET, currentAccount.username], async () => {
        await dispatch(fetchAndSetCoinsData(isRefreshing));
        setIsRefreshing(false);
        return true;
    });

    const _onRefresh = () => {
        setIsRefreshing(true);
    }

    return {
        ...query,
        refresh:_onRefresh,
        isRefreshing
    }
};