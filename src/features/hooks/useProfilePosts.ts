// src/features/hooks/useProfilePosts.ts
"use client";
import { useState, useEffect } from "react";
import { api } from "@/features/lib/api"; // your axios instance
import { PostPreview } from "../types";

export function useProfilePosts({
  limit = 24,
  cursor,
}: {
  limit?: number;
  cursor?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PostPreview[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const qs = new URLSearchParams();
    qs.set("limit", String(limit));
    if (cursor) qs.set("cursor", cursor);
    api
      .get(`/posts?${qs.toString()}`)
      .then((res) => {
        if (!mounted) return;
        const data = res.data;
        setItems(Array.isArray(data.items) ? data.items : data);
        setNextCursor(data.nextCursor ?? null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [limit, cursor]);

  return { items, nextCursor, loading, error };
}
