import { api } from "@/features/lib/api";
import { CommentWithLikeState } from "@/features/types";
import { useQuery } from "@tanstack/react-query";

export function useComments({
  postId,
  commentId,
  enabled = true,
}: {
  postId?: string;
  commentId?: string;
  enabled?: boolean;
}) {
  const query = useQuery({
    queryKey: commentId ? ["replies", commentId] : ["comments", postId],
    queryFn: async () => {
      const url = commentId
        ? `/comments/${commentId}/replies`
        : `/comments/post/${postId}`;
      const res = await api.get<CommentWithLikeState[]>(url);
      return res.data;
    },
    enabled,
  });

  return query;
}
