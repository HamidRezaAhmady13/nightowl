// src/features/components/posts/PostTile.tsx
"use client";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { GeneralLink } from "../shared/GeneralLink";

export default function PostTile({
  post,
  onClick,
}: {
  post: { id: string; imageUrl?: string | null };
  onClick?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const openModalByQuery = (e?: React.MouseEvent) => {
    if (e) {
      // left click only: prevent the Link navigation
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      e.stopPropagation();
    }
    const params = new URLSearchParams(String(search ?? ""));
    params.set("postId", post.id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    openModalByQuery(e);
  };
  return (
    <GeneralLink
      href={`/post/${post.id}`}
      className="relative w-full aspect-square u-focus-not-visible"
      onClick={handleLinkClick}
    >
      <div
        role="button"
        onClick={(e) => {
          // ensure keyboard/space/enter could also open modal if you wire key handlers
          openModalByQuery();
        }}
        className="relative w-full aspect-square overflow-hidden u-bg-grey rounded-md"
        aria-label="Open post"
      >
        {post.imageUrl ? (
          // Next Image expects absolute or configured loader; adapt if needed
          <Image
            src={post.imageUrl}
            alt=""
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="h-full w-full u-flex-center u-text-md u-text-tertiary">
            No image
          </div>
        )}
      </div>
    </GeneralLink>
  );
}
