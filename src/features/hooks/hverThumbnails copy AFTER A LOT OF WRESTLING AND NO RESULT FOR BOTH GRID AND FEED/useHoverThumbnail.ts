import { useEffect, useRef } from "react";
import { useCanvasManager } from "./useCanvasManager";
import { useSeekHoverListeners } from "./useSeekHoverListeners";
import {
  attachMoveHandlerToDoc,
  findSeekEl,
  createOnMove,
  createPointerOutHandler,
  HIDE_HOLD_MS,
} from "./hoverThumbnailUtils";
import { ThumbnailsParams } from "./canvas.types";

export function useHoverThumbnail({
  videoRef,
  canvasRef,
  thumbUrlFn,
  seekBarSelector,
  intervalSec = 30,
  width = 160,
  height = 90,
  imageCache = {},
}: ThumbnailsParams) {
  const canvasMgr = useCanvasManager(canvasRef, { width, height });
  const seekListeners = useSeekHoverListeners(seekBarSelector);

  const mountedRef = useRef(true);
  const lastMoveTsRef = useRef<number>(0);
  const HEARTBEAT_MS = 300;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasMgr.getCanvas();
    if (!canvas || !videoRef?.current) return;

    const deps = {
      mountedRef,
      videoRef,
      canvasMgr,
      lastMoveTsRef,
      seekListeners,
      seekBarSelector,
      intervalSec,
      height,
      imageCache,
      thumbUrlFn,
    };

    const wrappedOnMove = createOnMove(deps);
    const wrappedPointerOut = createPointerOutHandler({
      canvasMgr,
      seekListeners,
      HIDE_HOLD_MS,
      seekBarSelector,
    });

    document.addEventListener("pointerout", wrappedPointerOut);

    const currentSeek =
      (seekListeners as any).boundSeekRef?.current ??
      findSeekEl(seekBarSelector);
    let detachDocMove: (() => void) | null = null;
    if (currentSeek) {
      currentSeek.addEventListener("mousemove", wrappedOnMove);
      const ownerDoc = currentSeek.ownerDocument ?? document;
      detachDocMove = attachMoveHandlerToDoc(ownerDoc, wrappedOnMove);
    } else {
      document.addEventListener("mousemove", wrappedOnMove);
    }

    const hb = window.setInterval(() => {
      const now = Date.now();
      const canvasLocal = canvasMgr.getCanvas();
      if (!canvasLocal) return;
      if (
        lastMoveTsRef.current &&
        now - lastMoveTsRef.current > HIDE_HOLD_MS + 1000
      ) {
        canvasMgr.scheduleHide(0);
        lastMoveTsRef.current = 0;
      }
    }, HEARTBEAT_MS);

    return () => {
      if (currentSeek)
        currentSeek.removeEventListener("mousemove", wrappedOnMove);
      else document.removeEventListener("mousemove", wrappedOnMove);
      if (detachDocMove) detachDocMove();
      document.removeEventListener("pointerout", wrappedPointerOut);
      window.clearInterval(hb);
    };
  }, [
    canvasMgr,
    videoRef,
    thumbUrlFn,
    intervalSec,
    width,
    height,
    imageCache,
    seekBarSelector,
  ]);
}
