import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../ecency/ecency";
import { NotificationFilters } from "../ecency/ecency.types";
import QUERIES from "./queryKeys";


export const useNotificationsQuery = ( filter : NotificationFilters) => {
    return useQuery([QUERIES.NOTIFICATIONS.GET, filter], async () => {
        const resonse = getNotifications({ filter, since: undefined, limit: 20 })
        return resonse || []
        // const lastId = res.length > 0 ? [...res].pop().id : null;

        // if (loadMore && (lastId === lastNotificationId || res.length === 0)) {
        //     setEndOfNotification(true);
        //     setIsRefershing(false);
        //     setIsLoading(false);
        // } else {
            // console.log('');
            // const stateNotifications = notificationsMap.get(type) || [];
            // const _notifications = loadMore
            //     ? unionBy(stateNotifications, res, 'id')
            //     : loadUnread
            //         ? unionBy(res, stateNotifications, 'id')
            //         : res;
            // notificationsMap.set(type, _notifications);
            // setNotificationsMap(notificationsMap);
            // setLastNotificationId(lastId);
            // setIsRefershing(false);
            // setIsLoading(false);
        // }
    });
}
