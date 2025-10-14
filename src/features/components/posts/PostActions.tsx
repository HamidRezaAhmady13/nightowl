// import { formatCount } from "@/features/utils/formatCount";
// import { Post, PostActionsProps } from "@/features/types";
// import Button from "../shared/Button";
// import { useToggleLike } from "@/features/hooks/useToggleLike";
// import CommentForm from "../comment/CommentForm";
// import { useState } from "react";
// import CommentModal from "../comment/CommentsModal";
// // import { API_URL } from "@/features/lib/api";

// export function PostActions({ post, currentUserId }: PostActionsProps) {
//   const isLiked = (post.likedBy ?? []).some((u) => u.id === currentUserId);
//   const toggleLikeMutation = useToggleLike(post.id, currentUserId);
//   const [activePost, setActivePost] = useState<string | null>(null);
//   console.log(post);

//   return (
//     <>
//       <div className="u-flex-center gap-md  ">
//         <Button
//           className="u-bg-transparent hover:u-bg-transparent   u-focus-not-visible   w-3xl"
//           onClick={() => {
//             toggleLikeMutation.mutate();
//           }}
//         >
//           <span>{isLiked ? "❤️" : "🤍"}</span>
//           <span className="u-text-tertiary u-text-sm inline-block w-xl text-right tabular-nums">
//             {formatCount(post.likesCount)}
//           </span>
//         </Button>
//         <Button
//           onClick={() => setActivePost(post.id)}
//           className="u-bg-transparent hover:u-bg-transparent  u-focus-not-visible   w-3xl"
//         >
//           <span>💬</span>
//           <span className="u-text-tertiary u-text-sm  inline-block w-xl text-right tabular-nums">
//             {formatCount(post.commentsCount)}
//           </span>
//         </Button>
//         {activePost && (
//           <CommentModal postId={post.id} onClose={() => setActivePost("")} />
//         )}
//         <CommentForm postId={post.id} />
//       </div>
//       <div>
//         <span className="u-text-tertiary u-text-xs ">
//           Posted on {new Date(post.createdAt).toLocaleString()}
//         </span>
//       </div>
//     </>
//   );
// }
"use client";

import { formatCount } from "@/features/utils/formatCount";
import { Post } from "@/features/types";
import { useToggleLike } from "@/features/hooks/useToggleLike";
import Button from "../shared/Button";
import CommentForm from "../comment/CommentForm";

export type PostActionsProps = {
  post: Post;
  currentUserId: string;
  onCommentClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function PostActions({
  post,
  currentUserId,
  onCommentClick,
}: PostActionsProps) {
  const isLiked = post.likedBy?.some((u) => u.id === currentUserId);
  const toggleLike = useToggleLike(post.id, currentUserId);

  return (
    <>
      <div className="u-flex-center gap-md">
        <Button
          type="button"
          aria-label={isLiked ? "Unlike post" : "Like post"}
          className="u-bg-transparent hover:u-bg-transparent u-focus-not-visible w-3xl"
          onClick={(e) => {
            e.stopPropagation();
            toggleLike.mutate();
          }}
        >
          <span>{isLiked ? "❤️" : "🤍"}</span>
          <span className="u-text-tertiary u-text-sm inline-block w-xl text-right tabular-nums">
            {formatCount(post.likesCount)}
          </span>
        </Button>

        <Button
          type="button"
          aria-label="Show comments"
          className="u-bg-transparent hover:u-bg-transparent u-focus-not-visible w-3xl"
          onClick={(e) => {
            e.stopPropagation();
            onCommentClick?.(e);
          }}
        >
          <span>💬</span>
          <span className="u-text-tertiary u-text-sm inline-block w-xl text-right tabular-nums">
            {formatCount(post.commentsCount)}
          </span>
        </Button>

        <CommentForm postId={post.id} className="max-w-lg  " />
      </div>

      <div>
        <span className="u-text-tertiary u-text-xs">
          Posted on {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>
    </>
  );
}
