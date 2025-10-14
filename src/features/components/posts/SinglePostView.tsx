import { Post } from "@/features/types";
import PostMedia from "./PostMedia";
import PostFiles from "./PostFiles";
import { PostActions } from "./PostActions";
import { useCurrentUser } from "@/features/hooks/useCurrentUser";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";

export default function SinglePostView({ post }: { post: Post }) {
  const { data: currentUser } = useCurrentUser();
  if (!currentUser) return null;

  return (
    <div className="    relative    ">
      <div className="p-md  dark:bg-cobalt-800 rounded space-y-md">
        <PostHeader post={post} />
        <div className="w-[90%] ml-lg">
          <PostMedia post={post} />
          <PostFiles files={post.media?.filter((m) => m.type === "file")} />
          <div className="mt-md">
            <PostContent post={post} />

            <PostActions
              post={post}
              currentUserId={currentUser?.id}
              onCommentClick={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
