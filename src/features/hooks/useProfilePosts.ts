// "use client";
// import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/features/lib/api"; // your axios instance

// type PostPreview = {
//   id: string;
//   imageUrl: string | null;
//   createdAt: string;
//   likesCount: number;
//   commentsCount: number;
// };

// export function useProfilePosts({
//   limit = 24,
//   initialCursor,
//   username,
// }: {
//   limit?: number;
//   initialCursor?: string;
//   username?: string;
// }) {
//   const [loading, setLoading] = useState(false);
//   const [items, setItems] = useState<PostPreview[]>([]);
//   const [cursor, setCursor] = useState<string | null>(initialCursor ?? null); // internal cursor
//   const [nextCursor, setNextCursor] = useState<string | null>(null); // last cursor returned by server
//   const [error, setError] = useState<Error | null>(null);
//   const [hasMore, setHasMore] = useState(true);

//   const inFlightRef = useRef<null | number>(null); // request token to ignore stale
//   const reqCounter = useRef(0);

//   // build url helper
//   const buildUrl = useCallback(
//     (cursorParam?: string | null) => {
//       const qs = new URLSearchParams();
//       qs.set("limit", String(limit));
//       if (cursorParam) qs.set("cursor", cursorParam);
//       return username
//         ? `/users/${encodeURIComponent(username)}/posts?${qs.toString()}`
//         : `/posts?${qs.toString()}`;
//     },
//     [limit, username]
//   );

//   // core fetch (internal): pass cursorParam = cursor you want to fetch after
//   const doFetch = useCallback(
//     async (cursorParam?: string | null) => {
//       // prevent double requests for same cursor
//       if (inFlightRef.current !== null) return null;
//       const reqId = ++reqCounter.current;
//       inFlightRef.current = reqId;
//       setLoading(true);
//       setError(null);

//       const url = buildUrl(cursorParam ?? undefined);
//       try {
//         const res = await api.get(url);
//         // ignore if another request started after this one
//         if (inFlightRef.current !== reqId) return null;

//         const data = res.data ?? {};
//         const pageItems: PostPreview[] = Array.isArray(data.items)
//           ? data.items
//           : data.items ?? [];

//         // if no cursorParam, this is a fresh load: replace items
//         setItems((prev) => {
//           if (!cursorParam) return pageItems;
//           // append but guard against duplicates by id
//           const ids = new Set(prev.map((p) => p.id));
//           const filtered = pageItems.filter((p) => !ids.has(p.id));
//           return [...prev, ...filtered];
//         });

//         setNextCursor(data.nextCursor ?? null);
//         setHasMore(Boolean(data.nextCursor));
//         return { items: pageItems, nextCursor: data.nextCursor ?? null };
//       } catch (err: any) {
//         if (inFlightRef.current === reqId) {
//           setError(err);
//         }
//         return null;
//       } finally {
//         if (inFlightRef.current === reqId) inFlightRef.current = null;
//         setLoading(false);
//       }
//     },
//     [buildUrl]
//   );

//   // initial load (runs once or when username/limit change)
//   useEffect(() => {
//     // reset state and load first page
//     setItems([]);
//     setNextCursor(null);
//     setCursor(initialCursor ?? null);
//     setHasMore(true);
//     const canceled = { v: false };
//     (async () => {
//       const result = await doFetch(initialCursor ?? null);
//       if (!canceled.v && result && result.nextCursor) {
//         // ensure internal cursor points to the last returned item (used if caller calls loadMore without using nextCursor)
//         setCursor(result.nextCursor);
//       }
//     })();
//     return () => {
//       canceled.v = true;
//     };
//     // intentionally depend on username and limit and initialCursor
//   }, [username, limit, initialCursor, doFetch]);

//   // public: explicit loadMore that appends next page
//   const loadMore = useCallback(async () => {
//     if (loading) return;
//     if (!hasMore) return;
//     // use server-provided nextCursor to fetch next page; fall back to internal cursor if needed
//     const cursorToUse = nextCursor ?? cursor;
//     // If nothing to use but hasMore true (rare), attempt fetch without cursor (safe)
//     const res = await doFetch(cursorToUse ?? null);
//     if (res && res.nextCursor) {
//       setCursor(res.nextCursor);
//       setNextCursor(res.nextCursor);
//     } else {
//       // no nextCursor => end of list
//       setCursor(null);
//       setNextCursor(null);
//       setHasMore(false);
//     }
//   }, [doFetch, hasMore, loading, nextCursor, cursor]);

//   // reload: clear and fetch first page again
//   const reload = useCallback(async () => {
//     // cancel any in-flight by bumping token
//     inFlightRef.current = null;
//     setItems([]);
//     setNextCursor(null);
//     setHasMore(true);
//     await doFetch(null);
//   }, [doFetch]);

//   // reset helper (no network)
//   const reset = useCallback(() => {
//     inFlightRef.current = null;
//     setItems([]);
//     setNextCursor(null);
//     setCursor(initialCursor ?? null);
//     setHasMore(true);
//     setError(null);
//     setLoading(false);
//   }, [initialCursor]);

//   return {
//     items,
//     nextCursor,
//     loading,
//     error,
//     hasMore,
//     loadMore,
//     reload,
//     reset,
//   } as const;
// }

// import { useCallback, useEffect, useState } from "react";

// type PostPreview = {
//   id: string;
//   imageUrl: string | null;
//   createdAt: string;
//   likesCount: number;
//   commentsCount: number;
// };

// export function useProfilePosts({
//   limit = 24,
//   username,
// }: {
//   limit?: number;
//   username?: string;
// }) {
//   const [loading, setLoading] = useState(false);
//   const [items, setItems] = useState<PostPreview[]>([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   const buildUrl = useCallback(
//     (p: number) => {
//       const qs = new URLSearchParams();
//       qs.set("limit", String(limit));
//       qs.set("cursor", String(p));
//       qs.set("page", String(p));
//       return username
//         ? `/users/${encodeURIComponent(username)}/posts?${qs.toString()}`
//         : `/posts?${qs.toString()}`;
//     },
//     [limit, username]
//   );

//   const fetchPage = useCallback(
//     async (p: number, replace = false) => {
//       setLoading(true);
//       setError(null);
//       try {
//         const url = buildUrl(p);
//         console.log("[posts] fetch", url);
//         const res = await api.get(url); // your existing api helper
//         const data = res.data ?? {};
//         const pageItems: PostPreview[] = Array.isArray(data.items)
//           ? data.items
//           : [];
//         console.log(
//           "[posts] response page",
//           p,
//           "items",
//           pageItems.map((i) => i.id)
//         );
//         setItems((prev) => (replace ? pageItems : [...prev, ...pageItems]));
//         setHasMore(pageItems.length === limit);
//       } catch (err: any) {
//         setError(err);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [buildUrl, limit]
//   );

//   useEffect(() => {
//     // initial load when username or limit changes
//     setItems([]);
//     setPage(1);
//     setHasMore(true);
//     fetchPage(1, true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [username, limit]);

//   const loadMore = useCallback(() => {
//     if (loading || !hasMore) return;
//     const next = page + 1;
//     setPage(next);
//     fetchPage(next, false);
//   }, [fetchPage, hasMore, loading, page]);

//   const reload = useCallback(() => {
//     setItems([]);
//     setPage(1);
//     setHasMore(true);
//     fetchPage(1, true);
//   }, [fetchPage]);

//   const reset = useCallback(() => {
//     setItems([]);
//     setPage(1);
//     setHasMore(true);
//     setError(null);
//     setLoading(false);
//   }, []);

//   return { items, loading, error, hasMore, loadMore, reload, reset } as const;
// }

// import { useCallback, useEffect, useState } from "react";

// type PostPreview = {
//   id: string;
//   imageUrl: string | null;
//   createdAt: string;
//   likesCount: number;
//   commentsCount: number;
// };

// export function useProfilePosts({
//   limit = 24,
//   username,
// }: {
//   limit?: number;
//   username?: string;
// }) {
//   const [loading, setLoading] = useState(false);
//   const [items, setItems] = useState<PostPreview[]>([]);
//   const [nextCursor, setNextCursor] = useState<string | null>(null);
//   const [hasMore, setHasMore] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   const buildUrl = useCallback(
//     (cursor?: string | null) => {
//       const qs = new URLSearchParams();
//       qs.set("limit", String(limit));
//       if (cursor) qs.set("cursor", String(cursor));
//       return username
//         ? `/users/${encodeURIComponent(username)}/posts?${qs.toString()}`
//         : `/posts?${qs.toString()}`;
//     },
//     [limit, username]
//   );

//   const fetchPage = useCallback(
//     async (cursor?: string | null, replace = false) => {
//       setLoading(true);
//       setError(null);
//       try {
//         const url = buildUrl(cursor ?? undefined);
//         console.log("[posts] fetch", url);
//         const res = await api.get(url);
//         const data = res.data ?? {};
//         const pageItems: PostPreview[] = Array.isArray(data.items)
//           ? data.items
//           : [];
//         console.log(
//           "[posts] response",
//           "items",
//           pageItems.map((i) => i.id),
//           "nextCursor",
//           data.nextCursor
//         );
//         setItems((prev) => (replace ? pageItems : [...prev, ...pageItems]));
//         const returnedNext = data.nextCursor ?? null;
//         setNextCursor(returnedNext);
//         setHasMore(Boolean(returnedNext));
//       } catch (err: any) {
//         setError(err);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [buildUrl]
//   );

//   useEffect(() => {
//     // initial load
//     setItems([]);
//     setNextCursor(null);
//     setHasMore(true);
//     fetchPage(null, true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [username, limit]);

//   const loadMore = useCallback(() => {
//     if (loading || !hasMore) return;
//     if (!nextCursor) return;
//     console.log("[posts] loadMore using cursor", nextCursor);
//     fetchPage(nextCursor, false);
//   }, [fetchPage, hasMore, loading, nextCursor]);

//   const reload = useCallback(() => {
//     setItems([]);
//     setNextCursor(null);
//     setHasMore(true);
//     fetchPage(null, true);
//   }, [fetchPage]);

//   const reset = useCallback(() => {
//     setItems([]);
//     setNextCursor(null);
//     setHasMore(true);
//     setError(null);
//     setLoading(false);
//   }, []);

//   return { items, loading, error, hasMore, loadMore, reload, reset } as const;
// }

// import { useCallback, useEffect, useRef, useState } from "react";

// type PostPreview = {
//   id: string;
//   imageUrl: string | null;
//   createdAt: string;
//   likesCount: number;
//   commentsCount: number;
// };

// export function useProfilePosts({
//   limit = 24,
//   username,
// }: {
//   limit?: number;
//   username?: string;
// }) {
//   const [loading, setLoading] = useState(false);
//   const [items, setItems] = useState<PostPreview[]>([]);
//   const [nextCursor, setNextCursor] = useState<string | null>(null);
//   const [hasMore, setHasMore] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   // serialize requests
//   const inFlightRef = useRef<number | null>(null);
//   const reqCounter = useRef(0);

//   const buildUrl = useCallback(
//     (cursor?: string | null) => {
//       const qs = new URLSearchParams();
//       qs.set("limit", String(limit));
//       if (cursor) qs.set("cursor", String(cursor));
//       return username
//         ? `/users/${encodeURIComponent(username)}/posts?${qs.toString()}`
//         : `/posts?${qs.toString()}`;
//     },
//     [limit, username]
//   );

//   const fetchPage = useCallback(
//     async (cursor?: string | null, replace = false) => {
//       // avoid starting a fetch while one is already in flight
//       if (inFlightRef.current !== null) {
//         console.log("[posts] fetch skipped — request already in flight");
//         return null;
//       }
//       const reqId = ++reqCounter.current;
//       inFlightRef.current = reqId;
//       setLoading(true);
//       setError(null);

//       try {
//         const url = buildUrl(cursor ?? undefined);
//         console.log("[posts] fetch url", url);
//         const res = await api.get(url); // keep your api helper
//         // if another request started after this one, ignore this result
//         if (inFlightRef.current !== reqId) {
//           console.log("[posts] ignoring stale response", reqId);
//           return null;
//         }
//         const data = res.data ?? {};
//         const pageItems: PostPreview[] = Array.isArray(data.items)
//           ? data.items
//           : [];
//         console.log(
//           "[posts] response ids",
//           pageItems.map((i) => i.id),
//           "nextCursor",
//           data.nextCursor
//         );
//         // replace or append (we dedupe by id to be safe)
//         setItems((prev) => {
//           if (replace) return pageItems;
//           const ids = new Set(prev.map((p) => p.id));
//           const filtered = pageItems.filter((p) => !ids.has(p.id));
//           return [...prev, ...filtered];
//         });
//         const returnedNext = data.nextCursor ?? null;
//         setNextCursor(returnedNext);
//         setHasMore(Boolean(returnedNext));
//         return { items: pageItems, nextCursor: returnedNext };
//       } catch (err: any) {
//         console.log("[posts] fetch error", err);
//         setError(err);
//         return null;
//       } finally {
//         if (inFlightRef.current === reqId) inFlightRef.current = null;
//         setLoading(false);
//       }
//     },
//     [buildUrl]
//   );

//   // initial load: single fetch that replaces items
//   useEffect(() => {
//     setItems([]);
//     setNextCursor(null);
//     setHasMore(true);
//     fetchPage(null, true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [username, limit]);

//   const loadMore = useCallback(() => {
//     if (loading || !hasMore) return;
//     if (!nextCursor) {
//       console.log("[posts] no nextCursor — nothing to load");
//       return;
//     }
//     console.log("[posts] loadMore using cursor", nextCursor);
//     fetchPage(nextCursor, false);
//   }, [fetchPage, hasMore, loading, nextCursor]);

//   const reload = useCallback(() => {
//     // cancel (logical) and fetch first page again
//     // we don't force-cancel the in-flight HTTP request, but we prevent handling another fetch concurrently
//     setItems([]);
//     setNextCursor(null);
//     setHasMore(true);
//     fetchPage(null, true);
//   }, [fetchPage]);

//   const reset = useCallback(() => {
//     inFlightRef.current = null;
//     setItems([]);
//     setNextCursor(null);
//     setHasMore(true);
//     setError(null);
//     setLoading(false);
//   }, []);

//   return { items, loading, error, hasMore, loadMore, reload, reset } as const;
// }

import { useCallback, useEffect, useRef, useState } from "react";

type PostPreview = {
  id: string;
  imageUrl: string | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
};

export function useProfilePosts({
  limit = 24,
  username,
}: {
  limit?: number;
  username?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PostPreview[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // serialize requests
  const inFlightRef = useRef<number | null>(null);
  const reqCounter = useRef(0);

  const buildUrl = useCallback(
    (cursor?: string | null) => {
      const qs = new URLSearchParams();
      qs.set("limit", String(limit));
      if (cursor) qs.set("cursor", String(cursor));
      return username
        ? `/users/${encodeURIComponent(username)}/posts?${qs.toString()}`
        : `/posts?${qs.toString()}`;
    },
    [limit, username]
  );

  const fetchPage = useCallback(
    async (cursor?: string | null, replace = false) => {
      // avoid starting a fetch while one is already in flight
      if (inFlightRef.current !== null) {
        console.log("[posts] fetch skipped — request already in flight");
        return null;
      }
      const reqId = ++reqCounter.current;
      inFlightRef.current = reqId;
      setLoading(true);
      setError(null);

      try {
        const url = buildUrl(cursor ?? undefined);
        console.log("[posts] fetch url", url);
        const res = await api.get(url); // keep your api helper
        // if another request started after this one, ignore this result
        if (inFlightRef.current !== reqId) {
          console.log("[posts] ignoring stale response", reqId);
          return null;
        }
        const data = res.data ?? {};
        console.log("############");
        console.log(data);

        console.log("############");
        const pageItems: PostPreview[] = Array.isArray(data.items)
          ? data.items
          : [];
        console.log(
          "[posts] response ids",
          pageItems.map((i) => i.id),
          "nextCursor",
          data.nextCursor
        );
        // replace or append (we dedupe by id to be safe)
        setItems((prev) => {
          if (replace) return pageItems;
          const ids = new Set(prev.map((p) => p.id));
          const filtered = pageItems.filter((p) => !ids.has(p.id));
          return [...prev, ...filtered];
        });
        const returnedNext = data.nextCursor ?? null;
        setNextCursor(returnedNext);
        setHasMore(Boolean(returnedNext));
        return { items: pageItems, nextCursor: returnedNext };
      } catch (err: any) {
        console.log("[posts] fetch error", err);
        setError(err);
        return null;
      } finally {
        if (inFlightRef.current === reqId) inFlightRef.current = null;
        setLoading(false);
      }
    },
    [buildUrl]
  );

  // initial load: single fetch that replaces items
  useEffect(() => {
    setItems([]);
    setNextCursor(null);
    setHasMore(true);
    fetchPage(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, limit]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    if (!nextCursor) {
      console.log("[posts] no nextCursor — nothing to load");
      return;
    }
    console.log("[posts] loadMore using cursor", nextCursor);
    fetchPage(nextCursor, false);
  }, [fetchPage, hasMore, loading, nextCursor]);

  const reload = useCallback(() => {
    // cancel (logical) and fetch first page again
    // we don't force-cancel the in-flight HTTP request, but we prevent handling another fetch concurrently
    setItems([]);
    setNextCursor(null);
    setHasMore(true);
    fetchPage(null, true);
  }, [fetchPage]);

  const reset = useCallback(() => {
    inFlightRef.current = null;
    setItems([]);
    setNextCursor(null);
    setHasMore(true);
    setError(null);
    setLoading(false);
  }, []);

  return { items, loading, error, hasMore, loadMore, reload, reset } as const;
}
