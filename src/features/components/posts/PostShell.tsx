"use client";

import { Post, PostMode } from "@/features/types";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { useCurrentUser } from "@/features/hooks/useCurrentUser";
import PostMedia from "./PostMedia";
import PostFiles from "./PostFiles";
import PostActions from "./PostActions";
import PostBorderBottom from "./PostBorderBottom";
import MediaWrapper from "./MediaWrapper";

type PostCardProps = {
  post: Post;
  onNavigate?: () => void;
  onCommentClick?: () => void;
  mode?: PostMode;
};

export default function PostShell({
  post,
  onNavigate,
  onCommentClick,
  mode = "feed",
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
      style={mode === "modal" ? { marginBottom: 0 } : undefined}
      className={`relative p-xxs rounded space-y-xs mb-md ${
        isInteractive ? "cursor-pointer u-focus-visible" : ""
      }`}
    >
      <PostHeader post={post} />
      {/* <PostMedia post={post} mode={mode} /> */}
      <MediaWrapper mode={mode} aspectClass={""}>
        <PostMedia post={post} mode={mode} />
      </MediaWrapper>

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
