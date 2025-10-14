"use client";

import { Post } from "@/features/types";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { useCurrentUser } from "@/features/hooks/useCurrentUser";
import PostMedia from "./PostMedia";
import PostFiles from "./PostFiles";
import PostActions from "./PostActions";
import PostBorderBottom from "./PostBorderBottom";

type PostCardProps = {
  post: Post;
  onNavigate?: () => void;
  onCommentClick?: () => void;
};

export default function PostShell({
  post,
  onNavigate,
  onCommentClick,
}: PostCardProps) {
  const { data: currentUser } = useCurrentUser();
  if (!currentUser) return null;

  const isInteractive = typeof onNavigate === "function";
  const handleNavigate = onNavigate ?? (() => {});
  const handleComment = onCommentClick ?? (() => {});

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? handleNavigate : undefined}
      onKeyDown={
        isInteractive ? (e) => e.key === "Enter" && handleNavigate() : undefined
      }
      className={`relative p-md rounded space-y-md ${
        isInteractive ? "cursor-pointer u-focus-visible" : ""
      }`}
    >
      <PostHeader post={post} />
      <PostMedia post={post} />
      <PostFiles files={post.media?.filter((m) => m.type === "file")} />
      <PostContent post={post} />

      <PostActions
        post={post}
        currentUserId={currentUser.id}
        onCommentClick={(e) => {
          e.stopPropagation();
          handleComment();
        }}
      />

      <PostBorderBottom />
    </div>
  );
}
