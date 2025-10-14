// // src/features/hooks/useAddComment.ts
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { api } from "../lib/api";
// import { Post, Comment as ApiComment } from "../types";
// type AddCommentVars = {
//   postId: string;
//   text: string;
//   parentCommentId?: string | null;
// };

// type ContextType = {
//   optimisticId?: string;
//   previousComments?: ApiComment[] | null;
//   previousPost?: Post | null;
// };

// export function useAddComment() {
//   const queryClient = useQueryClient();

//   const mutationFn = async (vars: AddCommentVars): Promise<ApiComment> => {
//     const { postId, text, parentCommentId } = vars;
//     const res = await api.post<ApiComment>(`/comments/post/${postId}`, {
//       text,
//       parentCommentId,
//     });
//     return res.data;
//   };

//   return useMutation<ApiComment, unknown, AddCommentVars, ContextType>({
//     mutationFn,
//     onMutate: async (vars) => {
//       const { postId, text, parentCommentId } = vars;
//       await queryClient.cancelQueries({ queryKey: ["comments", postId] });
//       await queryClient.cancelQueries({ queryKey: ["post", postId] });

//       const previousComments =
//         queryClient.getQueryData<ApiComment[]>(["comments", postId]) ?? null;
//       const previousPost =
//         queryClient.getQueryData<Post>(["post", postId]) ?? null;

//       const optimisticId = "optimistic-" + Date.now();

//       // make an optimistic comment that matches ApiComment shape
//       const optimisticComment: ApiComment = {
//         id: optimisticId,
//         postId,
//         parentCommentId: parentCommentId ?? null,
//         text,
//         createdAt: new Date().toISOString(),
//         likeCount: 0,
//         replyCount: 0,
//         author: {
//           id: "me", // replace with current user id if available
//           username: "You",
//           avatarUrl: null,
//         } as any,
//         childComments: [], // <<< required — add this
//         // include any other required fields your ApiComment type needs
//       };

//       queryClient.setQueryData<ApiComment[] | undefined>(
//         ["comments", postId],
//         (old) => {
//           const next = old ? [...old] : [];
//           // avoid duplicates
//           if (next.some((c) => c.id === optimisticId)) return next;
//           return [optimisticComment, ...next];
//         }
//       );

//       // optimistic update of post count if you keep posts list
//       queryClient.setQueryData<Post[] | undefined>(["posts"], (old) =>
//         old
//           ? old.map((p) =>
//               p.id === postId
//                 ? { ...p, commentsCount: (p.commentsCount ?? 0) + 1 }
//                 : p
//             )
//           : old
//       );

//       return { optimisticId, previousComments, previousPost };
//     },

//     onError: (_error, vars, context) => {
//       const { postId } = vars;
//       // rollback comments list
//       if (context?.previousComments !== undefined) {
//         queryClient.setQueryData(
//           ["comments", postId],
//           context.previousComments
//         );
//       }
//       // rollback post
//       if (context?.previousPost !== undefined) {
//         queryClient.setQueryData(["post", postId], context.previousPost);
//       }
//     },

//     onSuccess: (createdComment, vars, context) => {
//       const { postId } = vars;

//       // replace optimistic item with real comment or dedupe
//       queryClient.setQueryData<ApiComment[] | undefined>(
//         ["comments", postId],
//         (old) => {
//           const next = old ? [...old] : [];
//           if (context?.optimisticId) {
//             return next.map((c) =>
//               c.id === context.optimisticId ? createdComment : c
//             );
//           }
//           // if no optimistic id, prepend if not present
//           if (next.some((c) => c.id === createdComment.id)) return next;
//           return [createdComment, ...next];
//         }
//       );

//       // ensure single post detail is refreshed
//       queryClient.invalidateQueries({ queryKey: ["post", postId] });
//       // ensure comments list reconciles with server eventually
//       queryClient.invalidateQueries({ queryKey: ["comments", postId] });
//     },

//     onSettled: (_data, _error, vars) => {
//       if (vars?.postId) {
//         queryClient.invalidateQueries({ queryKey: ["post", vars.postId] });
//         queryClient.invalidateQueries({ queryKey: ["comments", vars.postId] });
//       }
//     },
//   });
// }
// // src/features/hooks/useAddComment.ts
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { api } from "../lib/api";
// import type { Post, Comment as ApiComment, User } from "../types";

// type AddCommentVars = {
//   postId: string;
//   text: string;
//   parentCommentId?: string | null;
// };
// type InfiniteComments = { pages: ApiComment[][]; pageParams: unknown[] };
// type ContextType = {
//   optimisticId?: string;
//   previousComments?: ApiComment[] | null;
//   previousPost?: Post | null;
// };

// const PAGE_LIMIT = 10;

// export function useAddComment(currentUser?: User | null) {
//   const queryClient = useQueryClient();

//   const mutationFn = async (vars: AddCommentVars): Promise<ApiComment> => {
//     const { postId, text, parentCommentId } = vars;
//     const res = await api.post<ApiComment>(`/comments/post/${postId}`, {
//       text,
//       parentCommentId,
//     });
//     return res.data;
//   };

//   return useMutation<ApiComment, unknown, AddCommentVars, ContextType>({
//     mutationFn,
//     onMutate: async (vars) => {
//       const { postId, text, parentCommentId } = vars;
//       await queryClient.cancelQueries({ queryKey: ["comments", postId] });
//       await queryClient.cancelQueries({ queryKey: ["post", postId] });

//       const previousComments =
//         queryClient.getQueryData<ApiComment[]>(["comments", postId]) ?? null;
//       const previousPost =
//         queryClient.getQueryData<Post>(["post", postId]) ?? null;

//       const optimisticId = "optimistic-" + Date.now();

//       const optimisticComment: ApiComment = {
//         id: optimisticId,
//         postId,
//         parentCommentId: parentCommentId ?? null,
//         text,
//         createdAt: new Date().toISOString(),
//         likeCount: 0,
//         replyCount: 0,
//         author: currentUser
//           ? {
//               id: currentUser.id,
//               username: currentUser.username,
//               avatarUrl: currentUser.avatarUrl,
//             }
//           : ({ id: "me", username: "You", avatarUrl: null } as any),
//         childComments: [],
//         // add any other required fields if your ApiComment type requires them
//       };

//       // handle plain array or infinite query shape; avoid duplicates
//       queryClient.setQueryData<any>(["comments", postId], (old) => {
//         if (!old) {
//           return { pages: [[optimisticComment]], pageParams: [1] };
//         }

//         // react-query infinite shape
//         if (old.pages && Array.isArray(old.pages)) {
//           const pages = old.pages.map((p: ApiComment[], idx: number) =>
//             idx === 0
//               ? [
//                   optimisticComment,
//                   ...p.filter((c: ApiComment) => c.id !== optimisticComment.id),
//                 ].slice(0, PAGE_LIMIT)
//               : p
//           );
//           return { ...old, pages };
//         }

//         // pages as array of arrays
//         if (Array.isArray(old) && Array.isArray(old[0])) {
//           const pages = [...old];
//           pages[0] = [
//             optimisticComment,
//             ...pages[0].filter(
//               (c: ApiComment) => c.id !== optimisticComment.id
//             ),
//           ].slice(0, PAGE_LIMIT);
//           return pages;
//         }

//         // plain array fallback
//         if (Array.isArray(old)) {
//           return [
//             optimisticComment,
//             ...old.filter((c: ApiComment) => c.id !== optimisticComment.id),
//           ].slice(0, PAGE_LIMIT);
//         }

//         return old;
//       });

//       // optimistic update of post count in feed
//       queryClient.setQueryData<Post[] | undefined>(["posts"], (old) =>
//         old
//           ? old.map((p) =>
//               p.id === postId
//                 ? { ...p, commentsCount: (p.commentsCount ?? 0) + 1 }
//                 : p
//             )
//           : old
//       );

//       return { optimisticId, previousComments, previousPost };
//     },

//     onError: (_error, vars, context) => {
//       const { postId } = vars;
//       if (context?.previousComments !== undefined) {
//         queryClient.setQueryData(
//           ["comments", postId],
//           context.previousComments
//         );
//       }
//       if (context?.previousPost !== undefined) {
//         queryClient.setQueryData(["post", postId], context.previousPost);
//       }
//     },

//     onSuccess: (createdComment, vars, context) => {
//       const { postId } = vars;

//       // replace optimistic item or prepend while deduping, and handle infinite/page shapes
//       queryClient.setQueryData<ApiComment[] | undefined>(
//         ["comments", postId],
//         (old: InfiniteComments | undefined) => {
//           if (!old) return { pages: [[createdComment]], pageParams: [1] };

//           if (old.pages && Array.isArray(old.pages)) {
//             const pages = old.pages.map((p: ApiComment[], idx: number) =>
//               idx === 0
//                 ? [
//                     createdComment,
//                     ...p.filter((c: ApiComment) => c.id !== createdComment.id),
//                   ].slice(0, PAGE_LIMIT)
//                 : p
//             );
//             // replace optimistic id if present
//             if (context?.optimisticId) {
//               pages[0] = pages[0].map((c: ApiComment) =>
//                 c.id === context.optimisticId ? createdComment : c
//               );
//               // ensure no duplicates
//               pages[0] = pages[0]
//                 .filter(
//                   (v, i, arr) => arr.findIndex((a) => a.id === v.id) === i
//                 )
//                 .slice(0, PAGE_LIMIT);
//             }
//             return { ...old, pages };
//           }

//           if (Array.isArray(old) && Array.isArray(old[0])) {
//             const pages = [...old];
//             pages[0] = [
//               createdComment,
//               ...pages[0].filter((c: ApiComment) => c.id !== createdComment.id),
//             ].slice(0, PAGE_LIMIT);
//             if (context?.optimisticId) {
//               pages[0] = pages[0].map((c: ApiComment) =>
//                 c.id === context.optimisticId ? createdComment : c
//               );
//               pages[0] = pages[0]
//                 .filter(
//                   (v, i, arr) => arr.findIndex((a) => a.id === v.id) === i
//                 )
//                 .slice(0, PAGE_LIMIT);
//             }
//             return pages;
//           }

//           if (Array.isArray(old)) {
//             const next = [
//               createdComment,
//               ...old.filter((c: ApiComment) => c.id !== createdComment.id),
//             ].slice(0, PAGE_LIMIT);
//             return next;
//           }

//           return old;
//         }
//       );

//       queryClient.invalidateQueries({ queryKey: ["post", postId] });
//       queryClient.invalidateQueries({ queryKey: ["comments", postId] });
//     },

//     onSettled: (_data, _error, vars) => {
//       if (vars?.postId) {
//         queryClient.invalidateQueries({ queryKey: ["post", vars.postId] });
//         queryClient.invalidateQueries({ queryKey: ["comments", vars.postId] });
//       }
//     },
//   });
// }
// src/features/hooks/useAddComment.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Post, Comment as ApiComment, User } from "../types";

type AddCommentVars = {
  postId: string;
  text: string;
  parentCommentId?: string | null;
};

type InfiniteComments = { pages: ApiComment[][]; pageParams: unknown[] };
type CommentsCache = InfiniteComments | ApiComment[] | ApiComment[][];

type ContextType = {
  optimisticId?: string;
  previousComments?: ApiComment[] | null;
  previousPost?: Post | null;
};

const PAGE_LIMIT = 10;

export function useAddComment(currentUser?: User | null) {
  const queryClient = useQueryClient();

  const mutationFn = async (vars: AddCommentVars): Promise<ApiComment> => {
    const { postId, text, parentCommentId } = vars;
    const res = await api.post<ApiComment>(`/comments/post/${postId}`, {
      text,
      parentCommentId,
    });
    return res.data;
  };

  return useMutation<ApiComment, unknown, AddCommentVars, ContextType>({
    mutationFn,

    onMutate: async (vars) => {
      const { postId, text, parentCommentId } = vars;

      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const previousComments =
        queryClient.getQueryData<ApiComment[]>(["comments", postId]) ?? null;
      const previousPost =
        queryClient.getQueryData<Post>(["post", postId]) ?? null;

      const optimisticId = "optimistic-" + Date.now();

      const optimisticComment: ApiComment = {
        id: optimisticId,
        postId,
        parentCommentId: parentCommentId ?? null,
        text,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        replyCount: 0,
        author: currentUser
          ? {
              id: currentUser.id,
              username: currentUser.username,
              avatarUrl: currentUser.avatarUrl,
            }
          : ({ id: "me", username: "You", avatarUrl: null } as any),
        childComments: [],
      };

      queryClient.setQueryData<CommentsCache | undefined>(
        ["comments", postId],
        (old: CommentsCache | undefined) => {
          if (!old) {
            return { pages: [[optimisticComment]], pageParams: [1] };
          }

          // react-query infinite shape
          if (
            (old as InfiniteComments).pages &&
            Array.isArray((old as InfiniteComments).pages)
          ) {
            const infinite = old as InfiniteComments;
            const pages = infinite.pages.map((p: ApiComment[], idx: number) =>
              idx === 0
                ? [
                    optimisticComment,
                    ...p.filter((c) => c.id !== optimisticComment.id),
                  ].slice(0, PAGE_LIMIT)
                : p
            );
            return { ...infinite, pages };
          }

          // pages as array of arrays (Comment[][])
          if (Array.isArray(old) && Array.isArray(old[0])) {
            const pages = (old as ApiComment[][]).map(
              (p: ApiComment[], idx: number) =>
                idx === 0
                  ? [
                      optimisticComment,
                      ...p.filter((c) => c.id !== optimisticComment.id),
                    ].slice(0, PAGE_LIMIT)
                  : p
            );
            return pages;
          }

          // plain array fallback
          if (Array.isArray(old)) {
            return [
              optimisticComment,
              ...(old as ApiComment[]).filter(
                (c) => c.id !== optimisticComment.id
              ),
            ].slice(0, PAGE_LIMIT);
          }

          return old;
        }
      );

      queryClient.setQueryData<Post[] | undefined>(["posts"], (old) =>
        old
          ? old.map((p) =>
              p.id === postId
                ? { ...p, commentsCount: (p.commentsCount ?? 0) + 1 }
                : p
            )
          : old
      );

      return { optimisticId, previousComments, previousPost };
    },

    onError: (_error, vars, context) => {
      const { postId } = vars;
      if (context?.previousComments !== undefined) {
        queryClient.setQueryData<ApiComment[] | undefined>(
          ["comments", postId],
          context.previousComments ?? undefined
        );
      }
      if (context?.previousPost !== undefined) {
        queryClient.setQueryData<Post | undefined>(
          ["post", postId],
          context.previousPost ?? undefined
        );
      }
    },

    onSuccess: (createdComment, vars, context) => {
      const { postId } = vars;

      queryClient.setQueryData<CommentsCache | undefined>(
        ["comments", postId],
        (old: CommentsCache | undefined) => {
          if (!old) {
            return { pages: [[createdComment]], pageParams: [1] };
          }

          // infinite query shape
          if (
            (old as InfiniteComments).pages &&
            Array.isArray((old as InfiniteComments).pages)
          ) {
            const infinite = old as InfiniteComments;
            let pages = infinite.pages.map((p: ApiComment[], idx: number) =>
              idx === 0
                ? [
                    createdComment,
                    ...p.filter((c) => c.id !== createdComment.id),
                  ].slice(0, PAGE_LIMIT)
                : p
            );

            if (context?.optimisticId) {
              pages[0] = pages[0].map((c) =>
                c.id === context.optimisticId ? createdComment : c
              );
              pages[0] = pages[0]
                .filter(
                  (v, i, arr) => arr.findIndex((a) => a.id === v.id) === i
                )
                .slice(0, PAGE_LIMIT);
            }

            return { ...infinite, pages };
          }

          // pages as array of arrays
          if (Array.isArray(old) && Array.isArray(old[0])) {
            const pages = (old as ApiComment[][]).map(
              (p: ApiComment[], idx: number) =>
                idx === 0
                  ? [
                      createdComment,
                      ...p.filter((c) => c.id !== createdComment.id),
                    ].slice(0, PAGE_LIMIT)
                  : p
            );

            if (context?.optimisticId) {
              pages[0] = pages[0].map((c) =>
                c.id === context.optimisticId ? createdComment : c
              );
              pages[0] = pages[0]
                .filter(
                  (v, i, arr) => arr.findIndex((a) => a.id === v.id) === i
                )
                .slice(0, PAGE_LIMIT);
            }

            return pages;
          }

          // plain array
          if (Array.isArray(old)) {
            const next = [
              createdComment,
              ...(old as ApiComment[]).filter(
                (c) => c.id !== createdComment.id
              ),
            ].slice(0, PAGE_LIMIT);
            return next;
          }

          return old;
        }
      );

      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },

    onSettled: (_data, _error, vars) => {
      if (vars?.postId) {
        queryClient.invalidateQueries({ queryKey: ["post", vars.postId] });
        queryClient.invalidateQueries({ queryKey: ["comments", vars.postId] });
      }
    },
  });
}
