"use client";

import { useState } from "react";
import PostShell from "@/features/components/posts/PostShell";
import CommentsModal from "@/features/components/comment/CommentsModal";
import Spinner from "@/features/components/shared/Spinner";
import { usePostsQuery } from "@/features/hooks/usePosts";

export default function FeedPage() {
  const { data: posts, isLoading } = usePostsQuery();
  const [activePostId, setActivePostId] = useState<string | null>(null);

  if (isLoading) return <Spinner />;

  return (
    <div>
      {posts?.map((post) => (
        <PostShell
          key={post.id}
          post={post}
          onCommentClick={() => setActivePostId(post.id)}
          mode={"feed"}
        />
      ))}

      {activePostId && (
        <CommentsModal
          postId={activePostId}
          onClose={() => setActivePostId(null)}
        />
      )}
    </div>
  );
}
