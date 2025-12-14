// useUnreadCount.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api"; // axios instance

export function useUnreadCount(userId?: string) {
  const queryClient = useQueryClient();
  return useQuery<number>({
    queryKey: ["notifications", userId ?? null, "unreadCount"],
    queryFn: async () => {
      const res = await api.get<{ unread: number }>(
        "/notifications/unread-count"
      );
      return res.data.unread;
    },
    enabled: !!userId,
    initialData: () => {
      const feed = queryClient.getQueryData<{ items: any[] }>([
        "notifications",
        userId ?? null,
      ]);
      return feed ? feed.items.filter((n) => !n.readAt).length : 0;
    },
  });
}
