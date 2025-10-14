import { useState } from "react";
import MediaRenderer from "../media/MediaRenderer";
import { PostContent } from "./PostContent";
import { PostHeader } from "./PostHeader";
import { SinglePostProps } from "@/features/types";
import { PostActions } from "./PostActions";

export default function SinglePost({
  post,
  currentUserId,
  isActive,
  onActivate,
}: SinglePostProps) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  return (
    <div className="p-md dark:bg-cobalt-800 rounded space-y-md relative">
      <PostHeader post={post} />
      <div className="w-[90%] ml-lg">
        <MediaRenderer
          media={post.media}
          isActive={isActive}
          onActivate={onActivate}
        />

        <PostContent post={post} />
        <PostActions
          post={post}
          currentUserId={currentUserId}
          onCommentClick={() => setIsCommentModalOpen(true)}
        />
      </div>
    </div>
  );
}
