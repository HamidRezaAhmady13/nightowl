"use client";
import NotificationItem from "@/features/components/notification/NotificationItem";
import Button from "@/features/components/shared/Button";
import Spinner from "@/features/components/shared/Spinner";
import { NotificationFeedPage } from "@/features/types/notification.types";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/features/hooks/useCurrentUser";
import { useNotifications } from "@/features/hooks/useNotifications";
import { useMarkManyRead } from "@/features/hooks/useMarkManyRead";

export default function notificationsPage() {
  const { data: currentUser } = useCurrentUser();
  const [isPending, setIsPending] = useState(true);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isPending: isLoading,
  } = useNotifications(currentUser?.id);

  useEffect(() => {
    setIsPending(isLoading);
  }, [isLoading]);

  const notifications =
    data?.pages.flatMap((p: NotificationFeedPage) => p.items) ?? [];

  const { mutate: markManyRead } = useMarkManyRead();

  useEffect(() => {
    if (notifications.length > 0) {
      const ids = notifications.map((n) => n.id);
      markManyRead(ids); // bulk mark current page
    }
  }, [notifications]);

  if (isLoading) return <Spinner />;

  if (notifications.length === 0) {
    return <div className="p-lg">No notifications</div>;
  }

  return (
    <>
      <ul className="space-y-2">
        {notifications.map((ntf) => (
          <NotificationItem ntf={ntf} key={ntf.id} />
        ))}
      </ul>

      {hasNextPage && (
        <div className="mt-md flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isLoading}
            className="u-btn"
          >
            {isLoading ? "Loading more..." : "Load more"}
          </Button>
        </div>
      )}
    </>
  );
}
