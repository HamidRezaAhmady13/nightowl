import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/features/lib/api";
import { Post } from "@/features/types";

export function useToggleLike(postId: string, currentUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post(`/posts/${postId}/toggle-like`);
    },
    onSuccess: () => {
      // 1️⃣ Update feed cache
      queryClient.setQueryData<Post[]>(["posts"], (old) => {
        if (!old) return old;
        return old.map((p) =>
          p.id === postId ? toggleLikeForPost(p, currentUserId) : p
        );
      });

      // 2️⃣ Update single post cache
      queryClient.setQueryData<Post>(["post", postId], (old) => {
        if (!old) return old;
        return toggleLikeForPost(old, currentUserId);
      });
    },
  });
}

// Helper to avoid repeating toggle logic
function toggleLikeForPost(post: Post, currentUserId: string): Post {
  const isLiked = (post.likedBy ?? []).some((u) => u.id === currentUserId);
  return {
    ...post,
    likedBy: isLiked
      ? (post.likedBy ?? []).filter((u) => u.id !== currentUserId)
      : [...(post.likedBy ?? []), { id: currentUserId }],
    likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
  };
}
