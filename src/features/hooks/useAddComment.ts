import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Post, Comment as ApiComment, User } from "../types";
import {
  AddCommentVars,
  CommentsCache,
  ContextType,
  InfiniteComments,
} from "../components/comment/comments.types";
import {
  insertTopLevel,
  replaceOptimistic,
  tryMergeReplyIntoRoots,
} from "../components/comment/commentsCacheHelpers";

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
        queryClient.getQueryData<ApiComment[] | CommentsCache>([
          "comments",
          postId,
        ]) ?? null;
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

      // optimistic insert for top-level comments only; replies are handled separately
      if (!parentCommentId) {
        queryClient.setQueryData<CommentsCache | undefined>(
          ["comments", postId],
          (old) =>
            insertTopLevel(old as CommentsCache | undefined, optimisticComment)
        );
      } else {
        // replies: keep optimistic reply in replies cache for the parent so UI shows it immediately
        queryClient.setQueryData<ApiComment[] | undefined>(
          ["replies", parentCommentId],
          (old) => {
            if (!old) return [optimisticComment];
            if (old.find((c) => c.id === optimisticComment.id)) return old;
            return [...old, optimisticComment];
          }
        );
      }

      // bump posts list count (if present)
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
        queryClient.setQueryData<CommentsCache | undefined>(
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
      const parentId = (createdComment as any).parentCommentId;

      // If it is a reply: update replies cache and try to merge into root only if parent exists there
      if (parentId) {
        // ensure replies cache contains created reply (avoid duplicates)
        queryClient.setQueryData<ApiComment[] | undefined>(
          ["replies", parentId],
          (old) => {
            if (!old) return [createdComment];
            if (old.find((c) => c.id === createdComment.id)) return old;
            return [...old, createdComment];
          }
        );

        // Try to merge reply into top-level comments root if parent exists there (non-destructive)
        queryClient.setQueryData<CommentsCache | undefined>(
          ["comments", postId],
          (old) => {
            return tryMergeReplyIntoRoots(
              old as CommentsCache | undefined,
              parentId,
              createdComment
            );
          }
        );

        // Ensure canonical server replies are refetched for parent
        queryClient.invalidateQueries({ queryKey: ["replies", parentId] });
        // Refresh counts
        queryClient.invalidateQueries({ queryKey: ["post", postId] });
        return;
      }

      // Top-level comment path: replace optimistic if present, else insert
      queryClient.setQueryData<CommentsCache | undefined>(
        ["comments", postId],
        (old) => {
          if (!old)
            return {
              pages: [[createdComment]],
              pageParams: [1],
            } as InfiniteComments;

          // if there was an optimistic id, replace it; otherwise insert at top
          if (context?.optimisticId) {
            const replaced = replaceOptimistic(
              old as CommentsCache | undefined,
              context.optimisticId,
              createdComment
            );
            // if replacement changed nothing, fallback to insert
            return (
              replaced ??
              insertTopLevel(old as CommentsCache | undefined, createdComment)
            );
          }

          return insertTopLevel(
            old as CommentsCache | undefined,
            createdComment
          );
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
