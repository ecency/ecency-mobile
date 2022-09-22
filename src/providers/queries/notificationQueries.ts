import { useInfiniteQuery } from "@tanstack/react-query";
import { getNotifications } from "../ecency/ecency";
import { NotificationFilters } from "../ecency/ecency.types";
import QUERIES from "./queryKeys";


export const useNotificationsQuery = (filter: NotificationFilters) => {
    const _fetchLimit = 20
    return useInfiniteQuery<any[]>([QUERIES.NOTIFICATIONS.GET, filter], async ({ pageParam }) => {
        console.log("fetching page since:", pageParam)
        const response = getNotifications({ filter, since: pageParam, limit: _fetchLimit })
        console.log("new page fetched", response)
        return response || []
    }, {
        initialData: {
            pageParams: [undefined],
            pages: []
        },
        getNextPageParam: (lastPage) => {
            const lastId = lastPage.length === _fetchLimit ? lastPage.lastItem.id : undefined;
            console.log("extracting next page parameter", lastId);
            return lastId;
        }
    });
}
