import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/features/lib/api";
import { Post } from "@/features/types";
import { useEffect } from "react";
import { toSingleString } from "../lib/toSingleString";

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

export function usePostsQuery() {
  const queryClient = useQueryClient();

  // 1) Run the feed fetch
  const result = useQuery<Post[], Error>({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await api.get("/posts/feed");
      return res.data as Post[];
    },
  });

  // 2) As soon as we have data, seed the single-post cache
  useEffect(() => {
    if (result.data) {
      result.data.forEach((p) => {
        queryClient.setQueryData(["post", p.id], p);
      });
    }
  }, [result.data, queryClient]);

  return result;
}
