import type { Comment as ApiComment } from "../../types";

import { CommentsCache, InfiniteComments, PAGE_LIMIT } from "./comments.types";

export function isInfiniteShape(
  v: CommentsCache | undefined
): v is InfiniteComments {
  return !!v && typeof (v as InfiniteComments).pages !== "undefined";
}
export function isPagesOfArrays(
  v: CommentsCache | undefined
): v is ApiComment[][] {
  return Array.isArray(v) && Array.isArray(v[0]);
}
export function isPlainArray(v: CommentsCache | undefined): v is ApiComment[] {
  return Array.isArray(v) && !Array.isArray(v[0]);
}
export function insertTopLevelInPlain(
  old: ApiComment[] | undefined,
  item: ApiComment
) {
  if (!old) return [item].slice(0, PAGE_LIMIT);
  return [item, ...old.filter((c) => c.id !== item.id)].slice(0, PAGE_LIMIT);
}

export function replaceOptimisticInPlain(
  old: ApiComment[] | undefined,
  optimisticId: string,
  real: ApiComment
) {
  if (!old) return [real];
  return old
    .map((c) => (c.id === optimisticId ? real : c))
    .filter((v, i, arr) => arr.findIndex((a) => a.id === v.id) === i)
    .slice(0, PAGE_LIMIT);
}

export function insertTopLevel(
  comments: CommentsCache | undefined,
  item: ApiComment
) {
  if (isInfiniteShape(comments)) {
    const infinite = comments;
    const pages = infinite.pages.map((p, idx) =>
      idx === 0
        ? [item, ...p.filter((c) => c.id !== item.id)].slice(0, PAGE_LIMIT)
        : p
    );
    return { ...infinite, pages };
  }
  if (isPagesOfArrays(comments)) {
    const pages = (comments as ApiComment[][]).map((p, idx) =>
      idx === 0
        ? [item, ...p.filter((c) => c.id !== item.id)].slice(0, PAGE_LIMIT)
        : p
    );
    return pages;
  }
  if (isPlainArray(comments)) {
    return insertTopLevelInPlain(comments as ApiComment[], item);
  }
  // fallback: create infinite shape
  return { pages: [[item]], pageParams: [1] } as InfiniteComments;
}

export function replaceOptimistic(
  comments: CommentsCache | undefined,
  optimisticId: string,
  real: ApiComment
) {
  if (isInfiniteShape(comments)) {
    const infinite = comments;
    const pages = infinite.pages.map((p, idx) =>
      idx === 0 ? replaceOptimisticInPlain(p, optimisticId, real) : p
    );
    return { ...infinite, pages };
  }
  if (isPagesOfArrays(comments)) {
    const pages = (comments as ApiComment[][]).map((p, idx) =>
      idx === 0 ? replaceOptimisticInPlain(p, optimisticId, real) : p
    );
    return pages;
  }
  if (isPlainArray(comments)) {
    return replaceOptimisticInPlain(
      comments as ApiComment[],
      optimisticId,
      real
    );
  }
  return comments;
}

export function tryMergeReplyIntoRoots(
  comments: CommentsCache | undefined,
  parentId: string,
  reply: ApiComment
) {
  if (!comments) return comments;

  // plain array
  if (isPlainArray(comments)) {
    return (comments as ApiComment[]).map((c) =>
      c.id === parentId
        ? {
            ...c,
            childComments: [...(c.childComments || []), reply],
            replyCount: (c.replyCount || 0) + 1,
          }
        : c
    );
  }

  // infinite shape: only try first page (common UX)
  if (isInfiniteShape(comments)) {
    const infinite = comments as InfiniteComments;
    const pages = infinite.pages.map((p, idx) =>
      idx === 0
        ? p
            .map((c) =>
              c.id === parentId
                ? {
                    ...c,
                    childComments: [...(c.childComments || []), reply],
                    replyCount: (c.replyCount || 0) + 1,
                  }
                : c
            )
            .slice(0, PAGE_LIMIT)
        : p
    );
    return { ...infinite, pages };
  }

  // pages-as-array-of-arrays
  if (isPagesOfArrays(comments)) {
    const pages = (comments as ApiComment[][]).map((p, idx) =>
      idx === 0
        ? p
            .map((c) =>
              c.id === parentId
                ? {
                    ...c,
                    childComments: [...(c.childComments || []), reply],
                    replyCount: (c.replyCount || 0) + 1,
                  }
                : c
            )
            .slice(0, PAGE_LIMIT)
        : p
    );
    return pages;
  }

  return comments;
}
