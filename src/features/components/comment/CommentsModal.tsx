// "use client";
// import React, { useRef, useEffect, useState } from "react";
// import ReactDOM from "react-dom";
// import CommentForm from "./CommentForm"; // your existing component
// import CommentItem from "./CommentItem";
// import { useComments } from "@/features/hooks/useComments";
// import { useModalStack } from "@/features/hooks/useModalStack";

// export default function CommentsModal({
//   postId,
//   onClose,
// }: {
//   postId: string;
//   onClose: () => void;
// }) {
//   const dialogRef = useRef<HTMLDivElement | null>(null);
//   const { data: comments, isLoading } = useComments({ postId });

//   const [replyTo, setReplyTo] = useState<{
//     id: string;
//     username: string;
//   } | null>(null);

//   const listRef = useRef<HTMLUListElement | null>(null);

//   useModalStack(() => onClose());

//   if (typeof window === "undefined") return null;

//   return ReactDOM.createPortal(
//     <div
//       className="fixed inset-0 z-[110] u-flex-center" // ensure higher z than parent modal
//       aria-modal="true"
//       role="presentation"
//     >
//       {/* Backdrop: captures pointerdown and closes the top modal */}
//       <div
//         className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//         onPointerDown={() => onClose()}
//       />

//       {/* Dialog: stops pointer events so they do not bubble to backdrop or lower modals */}
//       <div
//         ref={dialogRef}
//         role="dialog"
//         aria-label="Comments"
//         className="relative z-10 u-bg-deep rounded-lg w-full h-full sm:w-[60vw] sm:h-auto sm:max-w-xl sm:max-h-[80vh] flex flex-col"
//         onPointerDown={(e) => e.stopPropagation()}
//       >
//         <div className="p-md flex-1 overflow-y-auto">
//           <div className="u-flex-between mb-md">
//             <h2 className="u-text-lg u-text-secondary">Comments</h2>
//             <button onClick={onClose} className="u-text-tertiary u-text-xl">
//               ✕
//             </button>
//           </div>

//           {isLoading ? (
//             <p>Loading...</p>
//           ) : comments?.length ? (
//             <ul className="space-y-md">
//               {comments.map((c) => (
//                 <li key={c.id}>
//                   <CommentItem
//                     {...c}
//                     postId={postId}
//                     onReply={(id: string, username: string) => {
//                       setReplyTo({
//                         id,
//                         username,
//                       });
//                       // optional: scroll that comment into view after a tick
//                       setTimeout(() => {
//                         // try to scroll the comment into view (implement finding the element if needed)
//                         // e.g., document.getElementById(`comment-${id}`)?.scrollIntoView({ behavior: "smooth" })
//                         listRef.current?.scrollTo({
//                           top: 0,
//                           behavior: "smooth",
//                         });
//                       }, 50);
//                     }}
//                   />

//                   {replyTo?.id === c.id && (
//                     <div className="mt-sm" id={`reply-form-${c.id}`}>
//                       <CommentForm
//                         postId={postId}
//                         parentCommentId={replyTo.id}
//                         onSuccess={() => {
//                           setReplyTo(null);
//                           // optionally ensure replies open or scroll
//                           setTimeout(
//                             () =>
//                               listRef.current?.scrollTo({
//                                 top: 0,
//                                 behavior: "smooth",
//                               }),
//                             50
//                           );
//                         }}
//                         className="w-full"
//                       />
//                     </div>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="u-text-tertiary">No comments yet</p>
//           )}
//         </div>

//         <div className="border-t u-border p-md w-full">
//           <CommentForm
//             postId={postId}
//             // parentCommentId={replyTo?.id ? replyTo?.id : null}
//             onSuccess={() => {
//               listRef.current?.scrollTo({ top: 0 });
//             }}
//             className="w-full"
//           />
//         </div>
//       </div>
//     </div>,
//     document.body
//   );
// }

// filepath: /home/raven/Desktop/soicalApp/social-media-next/social-app-frontend-next/src/features/components/comment/CommentsModal.tsx
"use client";
import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import CommentForm from "./CommentForm"; // your existing component
import CommentItem from "./CommentItem";
import { useComments } from "@/features/hooks/useComments";
import { useModalStack } from "@/features/hooks/useModalStack";

export default function CommentsModal({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const { data: comments, isLoading } = useComments({ postId });
  const scrollToTop = () =>
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  const [replyTo, setReplyTo] = useState<{
    id: string;
    username: string;
  } | null>(null);

  const listRef = useRef<HTMLUListElement | null>(null);

  useModalStack(() => onClose());

  if (typeof window === "undefined") return null;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => prev?.focus();
  }, []);

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[110] u-flex-center" // ensure higher z than parent modal
      aria-modal="true"
      role="presentation"
    >
      {/* Backdrop: captures pointerdown and closes the top modal */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onPointerDown={() => onClose()}
      />

      {/* Dialog: stops pointer events so they do not bubble to backdrop or lower modals */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Comments"
        className="relative z-10 u-bg-deep rounded-lg w-full h-full sm:w-[60vw] sm:h-auto sm:max-w-xl sm:max-h-[80vh] flex flex-col"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="p-md flex-1 overflow-y-auto">
          <div className="u-flex-between mb-md">
            <h2 className="u-text-lg u-text-secondary">Comments</h2>
            <button onClick={onClose} className="u-text-tertiary u-text-xl">
              ✕
            </button>
          </div>

          {isLoading ? (
            <p>Loading...</p>
          ) : comments?.length ? (
            <ul className="space-y-md">
              {comments.map((c) => (
                <li key={c.id}>
                  <CommentItem
                    {...c}
                    postId={postId}
                    onReply={(id, username, text) => {
                      setReplyTo({ id, username });
                      /* local reply handler; keep state here */
                    }}
                  />

                  {replyTo?.id === c.id && (
                    <div className="mt-sm">
                      <CommentForm
                        postId={postId}
                        parentCommentId={replyTo.id}
                        initialText={`@${replyTo.username} `}
                        onSuccess={() => {
                          setReplyTo(null);

                          requestAnimationFrame(scrollToTop);
                        }}
                        className="w-full"
                      />
                      <div className="u-text-tertiary u-text-xs mt-xs">
                        Replying to <strong>{replyTo.username}</strong>{" "}
                        <button
                          className="u-text-link"
                          onClick={() => setReplyTo(null)}
                        >
                          cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="u-text-tertiary">No comments yet</p>
          )}
        </div>

        <div className="border-t u-border p-md w-full">
          <CommentForm
            postId={postId}
            // parentCommentId={}
            onSuccess={() => {
              /* optional */
            }}
            className="w-full"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
