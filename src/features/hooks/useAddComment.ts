import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  Post,
  ApiComment,
  User,
  AddCommentVars,
  ContextType,
} from "../types";
import {
  toWithLikeState,
  tryMergeReplyIntoRoots,
} from "../components/comment/commentsCacheHelpers";
import { bumpCommentsCount, rollbackComments } from "../utils/cacheUtils";
import { postsKey } from "../lib/postKey";

export function useAddComment(
  currentUser?: User | null,
  limit: number = Number(process.env.PAGE_LIMIT_ENV) || 10
) {
  const queryClient = useQueryClient();

  const mutationFn = async (vars: AddCommentVars): Promise<ApiComment> => {
    const { postId, text, parentCommentId } = vars;
    const res = await api.post<ApiComment>(`/comments/post/${postId}`, {
      text,
      parentCommentId,
    });
    const raw = res.data;

    return {
      id: raw.id,
      text: raw.text,
      author: raw.author,
      postId: raw.postId,
      createdAt: raw.createdAt,
      likeCount: raw.likeCount,
      replyCount: raw.replyCount,
      parentCommentId: raw.parentCommentId ?? null,
      childComments: [],
      likedByUsers: [],
    };
  };

  return useMutation<ApiComment, unknown, AddCommentVars, ContextType>({
    mutationFn,

    onMutate: async (vars) => {
      const { postId, text, parentCommentId } = vars;

      const optimisticId = "optimistic-" + Date.now();
      const optimistic = toWithLikeState({
        id: optimisticId,
        postId,
        parentCommentId: parentCommentId ?? null,
        text,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        replyCount: 0,
        author: currentUser ?? {
          id: "me",
          username: "You",
          avatarUrl: undefined,
          email: "optimistic@example.com",
        },
        childComments: [],
      });

      bumpCommentsCount(queryClient, postId, limit);

      if (!parentCommentId) {
        queryClient.setQueryData(["comments", postId], (old: any) => {
          if (!old || !old.pages?.length) {
            return {
              pages: [{ data: [optimistic], page: 1 }],
              pageParams: [1],
            };
          }
          const first = old.pages[0] ?? { data: [], page: 1 };
          return {
            ...old,
            pages: [
              { ...first, data: [optimistic, ...(first.data ?? [])] },
              ...old.pages.slice(1),
            ],
          };
        });
      } else {
        queryClient.setQueryData(["replies", parentCommentId], (old: any) => {
          if (!old || !old.pages?.length) {
            return {
              pages: [{ data: [optimistic], page: 1 }],
              pageParams: [1],
            };
          }
          const first = old.pages[0] ?? { data: [], page: 1 };
          return {
            ...old,
            pages: [
              { ...first, data: [optimistic, ...(first.data ?? [])] },
              ...old.pages.slice(1),
            ],
          };
        });
      }

      return { optimisticId, previousComments: null, previousPost: null };
    },
    // --- Rollback on error ---
    onError: (_error, vars, context) => {
      rollbackComments(
        queryClient,
        vars.postId,
        context?.previousComments ?? null,
        context?.previousPost ?? null
      );
    },

    onSuccess: (created, vars, ctx) => {
      const { postId } = vars;
      const parentId = created.parentCommentId;

      if (parentId) {
        queryClient.setQueryData(
          ["comments", postId],
          (old: any) => tryMergeReplyIntoRoots(old, parentId, created) // ensure this expects { pages: [{data,page}], ... }
        );
      } else {
        queryClient.setQueryData(["comments", postId], (old: any) => {
          if (!old || !old.pages?.length) {
            return {
              pages: [{ data: [toWithLikeState(created)], page: 1 }],
              pageParams: [1],
            };
          }
          const first = old.pages[0];
          // replace optimistic by id
          const replaced = first.data.map((c: any) =>
            c.id === ctx?.optimisticId ? toWithLikeState(created) : c
          );
          return {
            ...old,
            pages: [{ ...first, data: replaced }, ...old.pages.slice(1)],
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({
        queryKey: ["post", postId],
        exact: true,
      });

      queryClient.invalidateQueries({
        // queryKey: postsKey(limit),
        queryKey: postsKey,
        exact: true,
      });

      // 1111111111111111111111111111
      queryClient.setQueryData(
        postsKey,
        // postsKey(limit)
        (old: any) => {
          if (!old) return old;
          console.log("Feed cache before update:", old);
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((p: Post) =>
                p.id === postId
                  ? { ...p, commentsCount: (p.commentsCount ?? 0) + 1 }
                  : p
              ),
            })),
          };
        }
      );
    },
    // 1111111111111111111111111111

    //
    // --- Always refresh ---
    onSettled: (_data, _error, vars) => {
      if (vars?.postId) {
        queryClient.invalidateQueries({ queryKey: ["post", vars.postId] });
        queryClient.invalidateQueries({ queryKey: ["comments", vars.postId] });
      }
    },
  });
}
