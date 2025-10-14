// src/app/test/posts-grid/page.tsx
"use client";
import React, { useState } from "react";
import { useProfilePosts } from "@/features/hooks/useProfilePosts";
import PostTile from "@/features/components/posts/PostTile";
import Spinner from "@/features/components/shared/Spinner";
import { useRouter } from "next/navigation";
import Button from "../shared/Button";

export default function PostsGrid() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const { items, nextCursor, loading, error } = useProfilePosts({
    limit: 24,
    cursor,
  });
  const router = useRouter();

  if (loading)
    return (
      <div className="p-lg">
        <Spinner />
      </div>
    );
  if (error)
    return <div className="p-lg u-text-error">Error loading posts</div>;

  return (
    <div className="max-w-4xl mx-auto p-lg space-y-lg">
      <div className="grid grid-cols-3 gap-xs">
        {items.map((p) => (
          <PostTile
            key={p.id}
            post={{ id: p.id, imageUrl: p.imageUrl }}
            onClick={() => {
              router.push(`/post/${p.id}`);
            }}
          />
        ))}
      </div>

      <div className="u-flex-center space-x-md">
        <Button
          size={"xs"}
          height={"sm"}
          className="w-1/6"
          onClick={() => {
            if (!nextCursor) return;
            setCursor(nextCursor);
          }}
          disabled={!nextCursor}
        >
          Load more
        </Button>
        <Button
          className="w-1/6"
          size={"xs"}
          height={"sm"}
          onClick={() => {
            setCursor(undefined);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
