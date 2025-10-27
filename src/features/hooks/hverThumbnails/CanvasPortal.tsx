// components/hooks/hverThumbnails/CanvasPortal.tsx
"use client";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

export default function CanvasPortal({
  canvasRef,
  width = 160,
  height = 90,
  style,
  postId,
  onRemount,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  postId?: string;
  onRemount?: () => void;
}) {
  const [mountEl, setMountEl] = useState<HTMLElement | null>(() =>
    typeof document !== "undefined" ? document.body : null
  );

  useEffect(() => {
    const update = () => {
      const fs = document.fullscreenElement;
      setMountEl(fs && fs instanceof HTMLElement ? fs : document.body);
    };
    update();
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    // ensure portal canvas adopts correct stacking/context after remount
    if (typeof onRemount === "function") onRemount();
  }, [mountEl, canvasRef, postId, onRemount]);

  if (!mountEl) return null;

  const canvas = (
    <canvas
      data-postid={postId}
      data-owner="portal"
      ref={canvasRef}
      width={width}
      height={height}
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: 99999,
        display: "none",
        ...style,
      }}
    />
  );

  return ReactDOM.createPortal(canvas, mountEl);
}
