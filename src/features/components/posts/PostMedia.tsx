"use client";

// // components/PostMedia.tsx
// "use client";
// import { Player } from "react-tuby";
// import { useEffect, useRef } from "react";
// import { API_URL } from "@/features/lib/api";
// import {
//   getVideoVariants,
//   getPosterImage,
//   getPostImages,
// } from "@/app/utils/extractPostMedia";
// import PostGallery from "./PostGallery";
// import type { Post, PostMode } from "@/features/types";
// import { useCanvasDraw } from "@/features/hooks/hverThumbnails/useCanvasDraw";
// import CanvasPortal from "@/features/hooks/hverThumbnails/CanvasPortal";
// import MediaWrapper from "./MediaWrapper";
// import {
//   LANDSCAPE_RATIO,
//   PORTRAIT_RATIO,
//   SQUARE_RATIO,
// } from "@/features/types";

// export default function PostMedia({
//   post,
//   mode,
// }: {
//   post: Post;
//   mode: PostMode;
// }) {
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   const videoVariants = getVideoVariants(post);
//   const poster = getPosterImage(post);
//   const images = getPostImages(post);

//   useEffect(() => {
//     const container = document.getElementById(`video-container-${post.id}`);
//     if (container) {
//       videoRef.current = container.querySelector("video");
//     }
//   }, [post.id]);

//   const demoImg = "/images/placeholder-square.png"; // use any accessible URL or data URI
//   useCanvasDraw(canvasRef, {
//     imgSrc: demoImg,
//     width: 160,
//     height: 90,
//     visible: true,
//   });

//   const posterImg = poster ? `${API_URL}${poster.url}` : undefined;
//   const known = poster ? { w: 1200, h: 900 } : undefined; // quick fallback
//   const isVertical = known ? known.h > known.w : false;
//   const isSquare = known ? known.h === known.w : false;
//   const ratioClass =
//     mode === "feed"
//       ? isSquare
//         ? SQUARE_RATIO
//         : isVertical
//         ? PORTRAIT_RATIO
//         : LANDSCAPE_RATIO
//       : "";

//   return (
//     <div className="space-y-md">
//       {images && <PostGallery mode={mode} images={images} />}

//       {videoVariants.length > 0 && (
//         <div className="w-full max-w-3xl mx-auto">
//           <MediaWrapper mode={mode} aspectClass={ratioClass}>
//             <div className="absolute inset-0 media-fill">
//               <Player
//                 src={videoVariants.map((v) => ({
//                   quality: v.quality ?? "auto",
//                   url: `${API_URL}${v.url}`,
//                 }))}
//                 poster={posterImg}
//                 primaryColor="#c084fc"
//               />
//             </div>
//           </MediaWrapper>

//           <CanvasPortal
//             canvasRef={canvasRef}
//             width={160}
//             height={90}
//             postId={post.id}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useRef } from "react";
import { Player } from "react-tuby";
import { API_URL } from "@/features/lib/api";
import {
  getVideoVariants,
  getPosterImage,
  getPostImages,
} from "@/app/utils/extractPostMedia";
import PostGallery from "./PostGallery";
import type { Post, PostMode } from "@/features/types";
import { useCanvasDraw } from "@/features/hooks/hverThumbnails/useCanvasDraw";
import CanvasPortal from "@/features/hooks/hverThumbnails/CanvasPortal";
import MediaWrapper from "./MediaWrapper";
import {
  LANDSCAPE_RATIO,
  PORTRAIT_RATIO,
  SQUARE_RATIO,
} from "@/features/types";

export default function PostMedia({
  post,
  mode,
}: {
  post: Post;
  mode: PostMode;
}) {
  const demoImg = "/images/placeholder-square.png";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const videoVariants = getVideoVariants(post);
  const poster = getPosterImage(post);
  const images = getPostImages(post);
  const { redraw } = useCanvasDraw(canvasRef, {
    imgSrc: demoImg,
    width: 160,
    height: 90,
    visible: true,
  });
  useEffect(() => {
    const container = document.getElementById(`video-container-${post.id}`);
    if (container) videoRef.current = container.querySelector("video");
  }, [post.id]);

  const posterImg = poster ? `${API_URL}${poster.url}` : undefined;
  const known = poster ? { w: 1200, h: 900 } : undefined;
  const isVertical = known ? known.h > known.w : false;
  const isSquare = known ? known.h === known.w : false;
  const ratioClass =
    mode === "feed"
      ? isSquare
        ? SQUARE_RATIO
        : isVertical
        ? PORTRAIT_RATIO
        : LANDSCAPE_RATIO
      : "";

  return (
    <div className="space-y-md" id={`post-media-${post.id}`}>
      {images && <PostGallery mode={mode} images={images} />}

      {videoVariants.length > 0 && (
        <div
          className="w-full max-w-3xl mx-auto"
          id={`video-container-${post.id}`}
        >
          <MediaWrapper mode={mode} aspectClass={ratioClass}>
            {/* use relative media-fill in modal via CSS in MediaWrapper branch */}
            <div
              className={
                mode === "feed"
                  ? "absolute inset-0 media-fill"
                  : "relative media-fill"
              }
            >
              <Player
                src={videoVariants.map((v) => ({
                  quality: v.quality ?? "auto",
                  url: `${API_URL}${v.url}`,
                }))}
                poster={posterImg}
                primaryColor="#c084fc"
              />
            </div>
          </MediaWrapper>

          <CanvasPortal
            canvasRef={canvasRef}
            width={160}
            height={90}
            postId={post.id}
            onRemount={redraw}
          />
        </div>
      )}
    </div>
  );
}
