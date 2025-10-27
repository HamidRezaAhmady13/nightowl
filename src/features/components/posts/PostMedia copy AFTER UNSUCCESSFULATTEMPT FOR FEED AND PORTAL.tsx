// components/PostMedia.tsx
"use client";
import { Player } from "react-tuby";
import { useEffect, useRef } from "react";
import ThumbnailPreview from "../media/ThumbnailPreview";
import { useHoverThumbnail } from "@/features/hooks/hverThumbnails/useHoverThumbnail";
import { API_URL } from "@/features/lib/api";
import {
  getOriginalVideo,
  getVideoVariants,
  getPosterImage,
  getPostImages,
  extractThumbnailMeta,
} from "@/app/utils/extractPostMedia";
import PostGallery from "./PostGallery";
import type { Post } from "@/features/types";
import { useCanvasManager } from "@/features/hooks/hverThumbnails/useCanvasManager";

export default function PostMedia({
  post,
  mode,
}: {
  post: Post;
  mode?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCacheRef = useRef<Record<number, HTMLImageElement>>({});

  const originalVideo = getOriginalVideo(post);
  const videoVariants = getVideoVariants(post);
  const poster = getPosterImage(post);
  const images = getPostImages(post);
  const mgr = useCanvasManager(canvasRef, { width: 160, height: 90 });

  const { userId, postId, videoBaseName } = originalVideo
    ? extractThumbnailMeta(originalVideo.url)
    : { userId: "", postId: "", videoBaseName: "" };

  const thumbUrlFn = (sec: number) =>
    `${API_URL}/uploads/user-${userId}/post-${postId}/thumbnails/${videoBaseName}-thumbnail-${sec}s.webp`;

  useEffect(() => {
    const container = document.getElementById(`video-container-${post.id}`);
    if (container) {
      videoRef.current = container.querySelector("video");
    }
  }, [post.id]);

  useHoverThumbnail({
    videoRef,
    canvasRef,
    thumbUrlFn,
    seekBarSelector: `#video-container-${post.id} .tuby-seek-bar`,
    intervalSec: 30,
    width: 160,
    height: 90,
    imageCache: imageCacheRef.current,
  });

  return (
    <div className="space-y-md">
      {images && <PostGallery mode={mode} images={images} />}

      {videoVariants.length > 0 && (
        <>
          <div
            id={`video-container-${post.id}`}
            className="overflow-hidden rounded-2xl w-full  "
          >
            <Player
              src={videoVariants.map((v) => ({
                quality: v.quality ?? "auto",
                url: `${API_URL}${v.url}`,
              }))}
              poster={poster ? `${API_URL}${poster.url}` : undefined}
              primaryColor="#c084fc"
            />
          </div>

          <ThumbnailPreview canvasRef={canvasRef} width={160} height={90} />
        </>
      )}
    </div>
  );
}
