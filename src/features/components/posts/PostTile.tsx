// // src/features/components/posts/PostTile.tsx
"use client";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { GeneralLink } from "../shared/GeneralLink";
import { API_URL } from "@/features/lib/api";
import { MdOndemandVideo } from "react-icons/md";

function isVideo(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|mov|webm|mkv|webp)(\?.*)?$/i.test(url);
}

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
          <>
            <Image
              src={`${API_URL}${post.imageUrl}`}
              alt=""
              fill
              style={{
                objectFit: "cover",
                //
                width: "100%",
                height: "100%",
              }}
              onError={(e) => {
                console.log("img load failed for", post.id, post.imageUrl);
                (e.currentTarget as HTMLImageElement).dataset.failed = "1";
              }}
            />
            {isVideo(post.imageUrl) && (
              <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                <MdOndemandVideo className="text-white w-lg h-lg  " />
              </div>
            )}
          </>
        ) : (
          <div className="h-full w-full u-flex-center u-text-md u-text-tertiary">
            No image
          </div>
        )}
      </div>
    </GeneralLink>
  );
}
