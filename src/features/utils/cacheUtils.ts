import type { Post, CommentsCache, PostsInfiniteData } from "@/features/types";
//
import { QueryClient } from "@tanstack/react-query";

const limit = process.env.PAGE_LIMIT_ENV || 10;

// export function bumpCommentsCount(
//   queryClient: QueryClient,
//   postId: string,
//   limit?: number
// ) {
//   // update single post
//   queryClient.setQueryData<Post | undefined>(["post", postId], (old) =>
//     old ? { ...old, commentsCount: old.commentsCount + 1 } : old
//   );

//   // update feed list (use same key as usePostsInfinite)
//   queryClient.setQueryData<any>(["posts", limit], (old: any) => {
//     console.log(limit);
//     if (!old) return old;
//     return {
//       ...old,
//       pages: old.pages.map((page: any) => ({
//         ...page,
//         items: page.items.map((p: Post) =>
//           p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
//         ),
//       })),
//     };
//   });
// }
export function bumpCommentsCount(
  queryClient: QueryClient,
  postId: string,
  limit?: number
) {
  queryClient.setQueryData<Post | undefined>(["post", postId], (old) =>
    old ? { ...old, commentsCount: old.commentsCount + 1 } : old
  );

  queryClient.setQueryData<any>(["posts", { limit }], (old: any) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page: any) => ({
        ...page,
        items: page.items.map((p: Post) =>
          p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
        ),
      })),
    };
  });
}

export function rollbackComments(
  queryClient: QueryClient,
  postId: string,
  previousComments: CommentsCache | null,
  previousPost: Post | null
) {
  if (previousComments !== null) {
    queryClient.setQueryData<CommentsCache | undefined>(
      ["comments", postId],
      previousComments ?? undefined
    );
  }
  if (previousPost !== null) {
    queryClient.setQueryData<Post | undefined>(
      ["post", postId],
      previousPost ?? undefined
    );
  }
}
