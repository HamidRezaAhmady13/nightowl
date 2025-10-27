"use client";

import { useRef, useState } from "react";
import { useHoverThumbnail } from "@/features/hooks/hverThumbnails/useHoverThumbnail";
import { ThumbnailPreviewProps } from "./preview.types";

export function HoverThumbnailPreview({
  videoRef,
  thumbUrlFn,
  intervalSec = 30,
  seekBarSelector,
  width = 160,
  height = 90,
}: ThumbnailPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const imageCache = useRef<Record<number, HTMLImageElement>>({});

  useHoverThumbnail({
    videoRef,
    canvasRef,
    thumbUrlFn,
    seekBarSelector,
    intervalSec,
    width,
    height,
    setVisible,
    imageCache,
  });

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: "fixed",
        display: visible ? "block" : "none",
        pointerEvents: "none",
        zIndex: 999999,
        transform: "translateX(-50%)",
        border: "1px solid rgba(0,0,0,0.3)",
        background: "#000",
        borderRadius: "5px",
      }}
    />
  );
}
