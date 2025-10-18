import type { Post, Comment as ApiComment } from "../../types";
export type InfiniteComments = { pages: ApiComment[][]; pageParams: unknown[] };
export type CommentsCache = InfiniteComments | ApiComment[] | ApiComment[][];

export const PAGE_LIMIT = 10;

export type AddCommentVars = {
  postId: string;
  text: string;
  parentCommentId?: string | null;
};

export type ContextType = {
  optimisticId?: string;
  // previousComments?: ApiComment[] | null;
  previousComments?: CommentsCache | null;
  previousPost?: Post | null;
};
