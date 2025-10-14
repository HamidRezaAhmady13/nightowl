import Image from "next/image";
import { Player } from "react-tuby";

import { useEffect, useRef } from "react";
import { HoverThumbnailPreview } from "../media/ThumbnailPreview";
import { Post } from "@/features/types";
import {
  getVideoVariants,
  extractThumbnailMeta,
  getOriginalVideo,
  getPostImages,
  getPosterImage,
} from "@/app/utils/extractPostMedia";
import { API_URL } from "@/features/lib/api";

export default function PostMedia({ post }: { post: Post }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const originalVideo = getOriginalVideo(post);
  const videoVariants = getVideoVariants(post);
  const poster = getPosterImage(post);
  const images = getPostImages(post);

  const { userId, postId, videoBaseName } = originalVideo
    ? extractThumbnailMeta(originalVideo.url)
    : { userId: "", postId: "", videoBaseName: "" };

  useEffect(() => {
    const container = document.getElementById(`video-container-${post.id}`);
    if (container) {
      videoRef.current = container.querySelector("video");
    }
  }, [post.id]);

  return (
    <div className="space-y-md  ">
      {images.map((img) => (
        <Image
          key={img.id}
          src={`${API_URL}${img.url}`}
          alt=""
          width={600}
          height={400}
          className="rounded-2xl w-full"
        />
      ))}

      {videoVariants.length > 0 && (
        <>
          <div
            id={`video-container-${post.id}`}
            className="overflow-hidden rounded-2xl w-full "
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
          <HoverThumbnailPreview
            videoRef={videoRef}
            seekBarSelector={`#video-container-${post.id} .tuby-seek-bar`}
            intervalSec={30}
            width={160}
            height={90}
            thumbUrlFn={(sec) =>
              `${API_URL}/uploads/user-${userId}/post-${postId}/thumbnails/${videoBaseName}-thumbnail-${sec}s.webp`
            }
          />
        </>
      )}
    </div>
  );
}
