// "use client";

// import { useCurrentUser } from "@/features/hooks/useCurrentUser";
// import Spinner from "@/features/components/shared/Spinner";
// import PostShell from "@/features/components/posts/PostShell";
// import { usePostQuery } from "@/features/hooks/usePosts";

// export default function PostPage() {
//   const { data: post, isLoading } = usePostQuery();
//   const { data: currentUser } = useCurrentUser();

//   if (isLoading) return <Spinner />;
//   if (!currentUser || !post) return <p>no data found</p>;

//   return (
//     <div className=" max-w-3xl mx-auto py-xl px-md space-y-lg shadow-md">
//       <h1 className="u-text-lg u-text-socondary">Post Details</h1>

//       <PostShell post={post} />
//     </div>
//   );
// }
// app/posts/[id]/page.tsx
"use client";

import Spinner from "@/features/components/shared/Spinner";
import PostShell from "@/features/components/posts/PostShell";
import { usePostQuery } from "@/features/hooks/usePosts";
import { useCurrentUser } from "@/features/hooks/useCurrentUser";
import CommentsModal from "@/features/components/comment/CommentsModal";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PostPage() {
  const router = useRouter();
  const { data: post, isLoading } = usePostQuery();
  const { data: currentUser } = useCurrentUser();
  const [isOpenModal, setIsOpenModal] = useState<Boolean>(false);

  if (isLoading) return <Spinner />;
  if (!currentUser) return;
  if (!post) return <p>no data found</p>;

  return (
    <div className="max-w-3xl mx-auto py-xl px-md space-y-lg shadow-md">
      <h1 className="u-text-lg u-text-secondary">Post Details</h1>
      <PostShell post={post} onCommentClick={() => setIsOpenModal(true)} />
      {isOpenModal && (
        <CommentsModal postId={post.id} onClose={() => setIsOpenModal(false)} />
      )}
    </div>
  );
}
