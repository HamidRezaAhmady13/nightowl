import { useLayoutEffect, useRef } from "react";

import { handleMove } from "@/features/utils/handleMouseMove";

export function useHoverThumbnail({
  videoRef,
  canvasRef,
  thumbUrlFn,
  seekBarSelector,
  intervalSec,
  width,
  height,
  setVisible,
  imageCache,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  thumbUrlFn: (sec: number) => string;
  seekBarSelector: string;
  intervalSec: number;
  width: number;
  height: number;
  setVisible: (v: boolean) => void;
  imageCache: React.RefObject<Record<number, HTMLImageElement>>;
}) {
  const lastSnapRef = useRef<number>(-1);
  const durationRef = useRef(0);

  useLayoutEffect(() => {
    let cleanup: (() => void) | undefined;
    let timeoutId: NodeJS.Timeout;

    const waitForElements = () => {
      if (!videoRef.current || !canvasRef.current) {
        timeoutId = setTimeout(waitForElements, 50);
        return;
      }
      waitForSeekBar();
    };

    const waitForSeekBar = () => {
      const bar = document.querySelector(seekBarSelector) as HTMLElement | null;
      if (bar) {
        cleanup = attachListeners(bar);
      } else {
        timeoutId = setTimeout(waitForSeekBar, 50);
      }
    };

    const attachListeners = (bar: HTMLElement) => {
      if (!videoRef.current) return; // extra safety
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      const videoEl = videoRef.current;
      let duration = videoEl.duration || 0;

      if (videoEl.readyState < 1) {
        videoEl.addEventListener("loadedmetadata", () => {
          duration = videoEl.duration;
        });
      }

      if (videoEl.readyState >= 1) {
        durationRef.current = videoEl.duration;
      } else {
        videoEl.addEventListener("loadedmetadata", () => {
          durationRef.current = videoEl.duration;
        });
      }

      const handleMouseMove = (e: MouseEvent) => {
        handleMove({
          e,
          bar,
          intervalSec,
          duration: videoEl.duration || 0, // live read
          lastSnapRef,
          imageCache: imageCache.current,
          canvasRef,
          ctx,
          width,
          height,
          setVisible,
          thumbUrlFn,
        });
      };

      const handleLeave = () => {
        lastSnapRef.current = -1; // force next move to draw
        setVisible(false);
      };

      bar.addEventListener("mousemove", handleMouseMove);
      bar.addEventListener("mouseleave", handleLeave);

      return () => {
        bar.removeEventListener("mousemove", handleMouseMove);
        bar.removeEventListener("mouseleave", handleLeave);
      };
    };

    waitForElements();

    console.log(videoRef.current);

    return () => {
      if (cleanup) cleanup();
      clearTimeout(timeoutId);
    };
  }, [
    videoRef,
    canvasRef,
    seekBarSelector,
    thumbUrlFn,
    intervalSec,
    width,
    height,
    setVisible,
    imageCache,
  ]);
}
