import { useEffect, useRef } from "react";
import {
  findSeekEl,
  measureSeekRect,
  isOverElement,
  getMountRoot,
  HIDE_HOLD_MS,
} from "./hoverThumbnailUtils";
import type { SeekListeners } from "./canvas.types";

export function useSeekHoverListeners(seekBarSelector?: string) {
  const boundSeekRef = useRef<HTMLElement | null>(null);
  const cachedRectRef = useRef<DOMRect | null>(null);
  const isOverSeekRef = useRef(false);
  const lastMoveTs = useRef<number>(0);

  const measure = (seekEl: HTMLElement | null): DOMRect | null => {
    if (!seekEl) {
      cachedRectRef.current = null;
      return null;
    }
    const r = measureSeekRect(seekEl);
    cachedRectRef.current = r;
    return r;
  };

  const bind = () => {
    const seekEl = findSeekEl(seekBarSelector);
    if (!seekEl) return;
    boundSeekRef.current = seekEl;
  };

  const unbind = () => {
    boundSeekRef.current = null;
    cachedRectRef.current = null;
  };

  const isOverSeek = () => !!isOverSeekRef.current;

  const computePosition = (
    rect: DOMRect,
    canvasHeightPx: number,
    gapPx = 8
  ) => {
    const root = getMountRoot();
    if (root === document.body) {
      return { left: rect.left, top: rect.top - gapPx - canvasHeightPx };
    }
    const rootRect = root.getBoundingClientRect();
    return {
      left: rect.left - rootRect.left,
      top: rect.top - gapPx - canvasHeightPx - rootRect.top,
    };
  };

  useEffect(() => {
    const onEnter = (ev?: Event) => {
      isOverSeekRef.current = true;
      lastMoveTs.current = Date.now();
      const seekEl = boundSeekRef.current ?? findSeekEl(seekBarSelector);
      measure(seekEl);
    };

    const onLeave = () => {
      isOverSeekRef.current = false;
      setTimeout(() => {
        cachedRectRef.current = null;
      }, HIDE_HOLD_MS + 50);
    };

    const onMove = (ev: MouseEvent) => {
      lastMoveTs.current = Date.now();
      const seekEl = boundSeekRef.current ?? findSeekEl(seekBarSelector);
      const rect = measure(seekEl) ?? undefined;
      if (!rect) return;
      // consumers will draw using rect and event
    };

    const ensureBound = () => {
      const seekEl = findSeekEl(seekBarSelector);
      if (!seekEl) return null;
      boundSeekRef.current = seekEl;
      seekEl.addEventListener("mouseenter", onEnter);
      seekEl.addEventListener("mouseleave", onLeave);
      seekEl.addEventListener("mousemove", onMove);
      return seekEl;
    };

    let bound = ensureBound();

    const pointerMoveHandler = (e: PointerEvent) => {
      lastMoveTs.current = Date.now();
      const seekEl = boundSeekRef.current ?? findSeekEl(seekBarSelector);
      const overSeek = seekEl
        ? isOverElement(e.clientX, e.clientY, seekEl)
        : false;
      if (overSeek) {
        if (!cachedRectRef.current) measure(seekEl);
      }
    };

    document.addEventListener("pointermove", pointerMoveHandler);
    window.addEventListener("resize", () => (cachedRectRef.current = null));
    window.addEventListener(
      "scroll",
      () => (cachedRectRef.current = null),
      true
    );

    return () => {
      if (bound) {
        bound.removeEventListener("mouseenter", onEnter);
        bound.removeEventListener("mouseleave", onLeave);
        bound.removeEventListener("mousemove", onMove);
      }
      document.removeEventListener("pointermove", pointerMoveHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekBarSelector]);

  return {
    lastRect: cachedRectRef.current,
    isOverSeek,
    bind: () => bind(),
    unbind,
    computePosition,
    boundSeekRef,
    cachedRectRef,
    lastMoveTs,
    HIDE_HOLD_MS,
  } as SeekListeners;
}
// console.log("function ClientFullscreenGuard() ");
