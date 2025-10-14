import { api } from "@/features/lib/api";
import { CommentWithLikeState, ToggleLikeVars } from "@/features/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleCommentLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, liked }: ToggleLikeVars) => {
      return liked
        ? api.delete(`/comments/${commentId}/like`)
        : api.post(`/comments/${commentId}/like`);
    },

    onMutate: async ({ commentId, liked, parentCommentId }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["comments", postId] }),
        parentCommentId
          ? queryClient.cancelQueries({
              queryKey: ["replies", parentCommentId],
            })
          : Promise.resolve(),
      ]);

      const prevComments = queryClient.getQueryData<CommentWithLikeState[]>([
        "comments",
        postId,
      ]);
      const prevReplies = parentCommentId
        ? queryClient.getQueryData<CommentWithLikeState[]>([
            "replies",
            parentCommentId,
          ])
        : undefined;

      // Update the tree under top-level comments
      queryClient.setQueryData<CommentWithLikeState[]>(
        ["comments", postId],
        (old) =>
          old?.map((c) => updateCommentLikeState(c, commentId, liked)) ?? old
      );

      // Update the replies list if applicable
      if (parentCommentId) {
        queryClient.setQueryData<CommentWithLikeState[]>(
          ["replies", parentCommentId],
          (old) =>
            old?.map((r) => updateCommentLikeState(r, commentId, liked)) ?? old
        );
      }

      return { prevComments, prevReplies, parentCommentId };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prevComments) {
        queryClient.setQueryData(["comments", postId], ctx.prevComments);
      }
      if (ctx?.parentCommentId && ctx?.prevReplies) {
        queryClient.setQueryData(
          ["replies", ctx.parentCommentId],
          ctx.prevReplies
        );
      }
    },

    // safety net: ensure server truth wins after optimistic update
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      if (vars.parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: ["replies", vars.parentCommentId],
        });
      }
    },
  });
}

function updateCommentLikeState(
  comment: CommentWithLikeState,
  commentId: string,
  liked: boolean
): CommentWithLikeState {
  if (comment.id === commentId) {
    return {
      ...comment,
      likeCount: liked ? comment.likeCount - 1 : comment.likeCount + 1,
      likedByCurrentUser: !liked,
    };
  }
  if (comment.childComments?.length) {
    return {
      ...comment,
      childComments: comment.childComments.map((child) =>
        updateCommentLikeState(child, commentId, liked)
      ),
    };
  }
  return comment;
}
