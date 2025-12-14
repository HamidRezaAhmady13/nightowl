import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";

import api from "../lib/api";
import { NotificationFeedPage } from "../types/notification.types";

export function useNotifications(userId?: string, limit = 10) {
  return useInfiniteQuery<
    NotificationFeedPage, // TQueryFnData
    Error, // TError
    InfiniteData<NotificationFeedPage>, // TData
    [string, string | undefined], // TQueryKey
    string | undefined // TPageParam
  >({
    queryKey: ["notifications", userId],
    queryFn: async ({ pageParam }) => {
      const res = await api.get<NotificationFeedPage>("/notifications", {
        params: { cursor: pageParam, limit },
      });

      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.cursor,
    initialPageParam: undefined,
    enabled: !!userId,
  });
}
