import { useParams } from "next/navigation";
// import { api } from "@/app/lib/api";
import { Post } from "@/features/types";
import { toSingleString } from "../lib/toSingleString";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
export function usePostQuery(opts?: { id?: string }) {
  const params = useParams();
  const paramId = toSingleString(params?.post);
  const postId = opts?.id ?? paramId;
  const queryClient = useQueryClient();

  return useQuery<Post, Error>({
    queryKey: ["post", postId],
    enabled: !!postId,

    // 1) Try to hydrate from the feed cache instantly
    initialData: () => {
      const feed = queryClient.getQueryData<Post[]>(["posts"]);
      return feed?.find((p) => p.id === postId);
    },

    // 2) If it wasn’t in cache, or if you reload directly, fetch from the server
    queryFn: async () => {
      const res = await api.get(`/posts/${postId}`);

      return res.data as Post;
    },
  });
}

export function usePostsQuery(page: number = 1, limit: number = 2) {
  return useQuery<{ items: Post[]; total: number }, Error>({
    queryKey: ["posts", { page, limit }],
    queryFn: async () =>
      (await api.get(`/posts/feed?limit=${limit}&page=${page}`)).data as {
        items: Post[];
        total: number;
      },

    ...({ keepPreviousData: true } as unknown as Record<string, unknown>),
  });
}
