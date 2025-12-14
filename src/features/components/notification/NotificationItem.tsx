// NotificationItem.tsx
import { Notification } from "@/features/types/notification.types";
import Image from "next/image";
import Link from "next/link";

export default function NotificationItem({ ntf }: { ntf: Notification }) {
  const isRemote = ntf.sourceUser?.avatarUrl?.startsWith("http");
  return (
    <Link
      href={
        ntf.payloadRef?.commentId
          ? `/post/${ntf.payloadRef.postId}?commentId=${ntf.payloadRef.commentId}`
          : ntf.payloadRef?.postId
          ? `/post/${ntf.payloadRef.postId}`
          : `/users/${ntf.sourceUser?.username}`
      }
    >
      <li key={ntf.id} className="p-sm rounded u-border my-sm">
        <div className="text-sm font-medium u-flex-start gap-sm">
          <Image
            width={24}
            height={24}
            unoptimized={!isRemote}
            quality={isRemote ? 20 : undefined}
            src={ntf.sourceUser?.avatarUrl ?? "/images/default-avatar.png"}
            alt={ntf.sourceUser?.username ?? "User avatar"}
            className="rounded-full"
          />
          {ntf.sourceUser?.username}{" "}
          {ntf.type === "like"
            ? "liked your post"
            : ntf.type === "comment"
            ? "commented on your post"
            : "followed you"}
        </div>
        <div className="text-xs u-text-secondary">
          {ntf.type} • {new Date(ntf.createdAt).toLocaleString()}
        </div>
        {ntf.readAt === null && (
          <span className="ml-2 u-text-cobalt-soft  font-semibold">Unread</span>
        )}
      </li>
    </Link>
  );
}
