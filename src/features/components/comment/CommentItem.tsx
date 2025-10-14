// import { CommentItemProps } from "@/features/types";
// import AvatarImage from "../shared/AvatarImage";
// import { useToggleCommentLike } from "@/features/hooks/useToggleCommentLike";
// import { useState } from "react";
// import { useComments } from "@/features/hooks/useComments";
// import { GeneralLink } from "../shared/GeneralLink";

// function CommentItem({
//   id,
//   text,
//   author,
//   postId,
//   isReply,
//   onReply,
//   parentIdForQuery,
//   createdAt,
//   likeCount,
//   replyCount,
//   likedByCurrentUser,
// }: CommentItemProps) {
//   const toggleLike = useToggleCommentLike(postId);
//   const [showReplies, setShowReplies] = useState(false);

//   const { data: replies, isLoading: repliesLoading } = useComments({
//     commentId: id,
//     enabled: showReplies,
//   });

//   return (
//     <div
//       className={`u-flex-start-start flex-col   gap-xs ${
//         isReply ? "ml-[1px]" : ""
//       }`}
//     >
//       {/*
//        */}
//       /* Replace the existing GeneralLink wrapper so it covers only avatar +
//       name */
//       <div className="u-flex-center gap-sm">
//         <GeneralLink
//           href={`/users/${author.username}`}
//           className="focus:outline-none rounded"
//         >
//           <AvatarImage
//             src={author.avatarUrl || undefined}
//             alt={author.username}
//             size={30}
//           />
//         </GeneralLink>

//         <div className="flex-col flex-1">
//           <GeneralLink
//             href={`/users/${author.username}`}
//             className="text-sm font-semibold"
//           >
//             {author.username}
//           </GeneralLink>
//         </div>
//       </div>
//       {/*  */}
//       <div className="ml-sm">
//         <p className="text-sm u-text-primary mt-xs">{text}</p>
//         <span className="u-text-tertiary u-text-xs">
//           {new Date(createdAt).toLocaleDateString()}
//         </span>
//         <div className="flex gap-md mt-sm   u-text-tertiary">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               toggleLike.mutate({
//                 commentId: id,
//                 liked: likedByCurrentUser,
//                 parentCommentId: isReply ? parentIdForQuery ?? null : null,
//               });
//             }}
//           >
//             {likedByCurrentUser ? "❤️" : "🤍"} ({likeCount})
//           </button>

//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               e.preventDefault();
//               console.log("reply-click", id, author.username);
//               onReply(id, author.username, text);
//             }}
//           >
//             Reply
//           </button>

//           {replyCount > 0 && !showReplies && (
//             <button
//               onClick={() => setShowReplies(true)}
//               className="u-text-cobalt-soft"
//             >
//               View {replyCount}
//               {replyCount === 1 ? " reply" : " replies"}
//             </button>
//           )}
//         </div>
//         {showReplies && (
//           <div className="mt-md   ml-lg border-l u-text-tertiary pl-md">
//             {repliesLoading ? (
//               <p className="text-xs u-text-tertiary">Loading replies...</p>
//             ) : (
//               replies?.map((reply) => (
//                 <CommentItem
//                   key={reply.id}
//                   {...reply}
//                   postId={postId}
//                   isReply
//                   onReply={onReply}
//                   parentIdForQuery={id}
//                 />
//               ))
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default CommentItem;
// filepath: /home/raven/Desktop/soicalApp/social-media-next/social-app-frontend-next/src/features/components/comment/CommentItem.tsx
import { CommentItemProps } from "@/features/types";
import AvatarImage from "../shared/AvatarImage";
import { useToggleCommentLike } from "@/features/hooks/useToggleCommentLike";
import { useState } from "react";
import { useComments } from "@/features/hooks/useComments";
import { GeneralLink } from "../shared/GeneralLink";

function CommentItem({
  id,
  text,
  author,
  postId,
  isReply,
  onReply,
  parentIdForQuery,
  createdAt,
  likeCount,
  replyCount,
  likedByCurrentUser,
}: CommentItemProps) {
  const toggleLike = useToggleCommentLike(postId);
  const [showReplies, setShowReplies] = useState(false);

  const { data: replies, isLoading: repliesLoading } = useComments({
    commentId: id,
    enabled: showReplies,
  });

  return (
    <div
      className={`u-flex-start-start flex-col   gap-xs ${
        isReply ? "ml-[1px]" : ""
      }`}
    >
      {/*
       */}
      /* Replace the existing GeneralLink wrapper so it covers only avatar +
      name */
      <div className="u-flex-center gap-sm">
        <GeneralLink
          href={`/users/${author.username}`}
          className="focus:outline-none rounded"
        >
          <AvatarImage
            src={author.avatarUrl || undefined}
            alt={author.username}
            size={30}
          />
        </GeneralLink>

        <div className="flex-col flex-1">
          <GeneralLink
            href={`/users/${author.username}`}
            className="text-sm font-semibold"
          >
            {author.username}
          </GeneralLink>
        </div>
      </div>
      {/*  */}
      <div className="ml-sm">
        <p className="text-sm u-text-primary mt-xs">{text}</p>
        <span className="u-text-tertiary u-text-xs">
          {new Date(createdAt).toLocaleDateString()}
        </span>
        <div className="flex gap-md mt-sm   u-text-tertiary">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike.mutate({
                commentId: id,
                liked: likedByCurrentUser,
                parentCommentId: isReply ? parentIdForQuery ?? null : null,
              });
            }}
          >
            {likedByCurrentUser ? "❤️" : "🤍"} ({likeCount})
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log("reply-click", id, author.username);
              onReply(id, author.username, text);
            }}
          >
            Reply
          </button>

          {replyCount > 0 && !showReplies && (
            <button
              onClick={() => setShowReplies(true)}
              className="u-text-cobalt-soft"
            >
              View {replyCount}
              {replyCount === 1 ? " reply" : " replies"}
            </button>
          )}
        </div>
        {showReplies && (
          <div className="mt-md   ml-lg border-l u-text-tertiary pl-md">
            {repliesLoading ? (
              <p className="text-xs u-text-tertiary">Loading replies...</p>
            ) : (
              replies?.map((reply) => (
                <CommentItem
                  key={reply.id} // Add key prop here
                  {...reply}
                  postId={postId}
                  isReply
                  onReply={onReply}
                  parentIdForQuery={id}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentItem;
