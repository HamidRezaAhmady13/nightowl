import { RefObject } from "react";
import { CanvasManager, SeekListeners } from "./canvas.types";

//
export type DprRef = React.RefObject<number>;
export type HideTimerRef = React.RefObject<number | null>;
//

export const getMountRoot = (): HTMLElement =>
  document.fullscreenElement &&
  document.fullscreenElement instanceof HTMLElement
    ? (document.fullscreenElement as HTMLElement)
    : document.body;

export const findSeekEl = (seekBarSelector?: string): HTMLElement | null => {
  if (!seekBarSelector) return null;
  const root = getMountRoot();
  return (
    (root.querySelector(seekBarSelector) as HTMLElement | null) ??
    (document.querySelector(seekBarSelector) as HTMLElement | null)
  );
};

export const mountCanvasInto = (
  canvas: HTMLCanvasElement,
  root?: HTMLElement
): void => {
  const target = root ?? getMountRoot();
  if (canvas.parentElement === target) {
    canvas.style.position = target === document.body ? "fixed" : "absolute";
    canvas.style.transform = "translate(-50%, -100%)";
    canvas.style.transformOrigin = "50% 100%";
    return;
  }

  const prevParent = canvas.parentElement;
  if (prevParent && prevParent.contains(canvas)) {
    try {
      prevParent.removeChild(canvas);
    } catch {}
  }

  canvas.style.position = target === document.body ? "fixed" : "absolute";
  canvas.style.transform = "translate(-50%, -100%)";
  canvas.style.transformOrigin = "50% 100%";
  try {
    if (!target.contains(canvas)) target.appendChild(canvas);
  } catch {}
};

export const computeCanvasPosition = (
  rect: DOMRect,
  opts?: {
    root?: HTMLElement;
    seekEl?: HTMLElement | null;
    canvasHeightPx?: number;
    gapPx?: number;
  }
) => {
  const root = opts?.root ?? getMountRoot();
  const gap = typeof opts?.gapPx === "number" ? opts!.gapPx : 8;
  const canvasHeightPx =
    typeof opts?.canvasHeightPx === "number" ? opts!.canvasHeightPx : 90;

  if (root === document.body) {
    return {
      left: rect.left,
      top: (opts?.seekEl ? rect.top : rect.bottom) - gap - canvasHeightPx,
    };
  } else {
    const rootRect = root.getBoundingClientRect();
    return {
      left: rect.left - rootRect.left,
      top:
        (opts?.seekEl ? rect.top : rect.bottom) -
        gap -
        canvasHeightPx -
        rootRect.top,
    };
  }
};

export const measureSeekRect = (seekEl: HTMLElement | null): DOMRect | null => {
  if (!seekEl) return null;
  return seekEl.getBoundingClientRect();
};

export const isOverElement = (
  x: number,
  y: number,
  el?: HTMLElement | null,
  ownerDoc?: Document
): boolean => {
  if (!el) return false;
  const doc = ownerDoc ?? document;
  const topEl = doc.elementFromPoint?.(x, y) as HTMLElement | null;
  if (!topEl) return false;
  return el.contains(topEl) || el === topEl;
};

export const safeMeasureRect = (
  seekEl: HTMLElement | null,
  videoRef: RefObject<HTMLVideoElement | null>
) => {
  if (!seekEl) return videoRef.current!.getBoundingClientRect();
  // prefer ownerDocument's getBoundingClientRect (same element)
  return measureSeekRect(seekEl) ?? videoRef.current!.getBoundingClientRect();
};

export const createOnMove = (deps: {
  mountedRef: React.RefObject<boolean>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasMgr: CanvasManager;
  lastMoveTsRef: React.RefObject<number>;
  seekListeners: SeekListeners;
  seekBarSelector?: string;
  intervalSec: number;
  height: number;
  imageCache: Record<number, HTMLImageElement>;
  thumbUrlFn: (sec: number) => string;
}) => {
  return (ev: MouseEvent) => {
    onMove(ev, deps);
  };
};

// createPointerOutHandler: returns a DOM-compatible pointerout handler bound to deps
export const createPointerOutHandler = (deps: {
  canvasMgr: CanvasManager;
  seekListeners: SeekListeners;
  HIDE_HOLD_MS: number;
  seekBarSelector?: string;
}) => {
  return (ev?: PointerEvent) => {
    // call existing pointerOutHandler with deps in the expected order
    pointerOutHandler(
      deps.canvasMgr,
      deps.seekListeners,
      deps.HIDE_HOLD_MS,
      deps.seekBarSelector,
      ev
    );
  };
};

export const attachMoveHandlerToDoc = (
  ownerDoc: Document,
  handler: (ev: MouseEvent) => void
) => {
  ownerDoc.addEventListener("mousemove", handler as EventListener);
  return () =>
    ownerDoc.removeEventListener("mousemove", handler as EventListener);
};

export const pointerOutHandler = (
  canvasMgr: CanvasManager,
  seekListeners: SeekListeners,
  HIDE_HOLD_MS: number,
  seekBarSelector?: string,
  e?: PointerEvent
) => {
  const canvasLocal = canvasMgr.getCanvas();
  const seekElLocal =
    (seekListeners as any).boundSeekRef?.current ?? findSeekEl(seekBarSelector);
  // ensure canvas is in same root as seek element to have consistent elementFromPoint
  if (canvasLocal && seekElLocal) {
    const seekRoot = seekElLocal.ownerDocument?.body ?? getMountRoot();
    if (canvasLocal.parentElement !== seekRoot) {
      try {
        mountCanvasInto(canvasLocal, seekRoot);
      } catch {}
    }
  }
  const overSeek = seekElLocal
    ? isOverElement(
        e?.clientX ?? 0,
        e?.clientY ?? 0,
        seekElLocal,
        seekElLocal?.ownerDocument
      )
    : false;
  const overCanvas = canvasLocal
    ? isOverElement(
        e?.clientX ?? 0,
        e?.clientY ?? 0,
        canvasLocal,
        canvasLocal.ownerDocument
      )
    : false;
  if (overSeek || overCanvas) return;
  if (canvasLocal) canvasMgr.scheduleHide(HIDE_HOLD_MS);
};

export function setSize(
  canvas: HTMLCanvasElement | null,
  w: number,
  h: number,
  dprRef: DprRef
): void {
  if (!canvas) return;
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  dprRef.current = dpr;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function show(
  canvas: HTMLCanvasElement | null,
  hideTimerRef: HideTimerRef
): void {
  if (!canvas) return;
  if (hideTimerRef.current) {
    window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }
  canvas.style.visibility = "visible";
  canvas.style.opacity = "1";
  canvas.style.pointerEvents = "none";
}

export function hide(
  canvas: HTMLCanvasElement | null,
  hideTimerRef: HideTimerRef,
  immediate = false
): void {
  if (!canvas) return;
  if (hideTimerRef.current) {
    window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }
  if (immediate) {
    canvas.style.opacity = "0";
    canvas.style.visibility = "hidden";
    return;
  }
  canvas.style.opacity = "0";
  canvas.style.visibility = "hidden";
}

export function mountIntoRoot(
  canvas: HTMLCanvasElement | null,
  root?: HTMLElement | null
): void {
  if (!canvas) return;
  const target = root ?? getMountRoot();
  if (canvas.parentElement === target) {
    canvas.style.position = target === document.body ? "fixed" : "absolute";
    canvas.style.transform = "translate(-50%, -100%)";
    canvas.style.transformOrigin = "50% 100%";
    return;
  }
  const prev = canvas.parentElement;
  if (prev && prev.contains(canvas)) {
    try {
      prev.removeChild(canvas);
    } catch {}
  }
  canvas.style.position = target === document.body ? "fixed" : "absolute";
  canvas.style.transform = "translate(-50%, -100%)";
  canvas.style.transformOrigin = "50% 100%";
  try {
    if (!target.contains(canvas)) target.appendChild(canvas);
  } catch {}
}

export function scheduleHide(
  canvas: HTMLCanvasElement | null,
  hideTimerRef: HideTimerRef,
  holdMs = 700
): void {
  if (!canvas) return;
  if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
  hideTimerRef.current = window.setTimeout(() => {
    canvas.style.opacity = "0";
    canvas.style.visibility = "hidden";
    hideTimerRef.current = null;
  }, holdMs) as unknown as number;
}

export const HIDE_HOLD_MS = 700;

export const onMove = (
  ev: MouseEvent,
  deps: {
    mountedRef: React.RefObject<boolean>;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasMgr: CanvasManager;
    lastMoveTsRef: React.RefObject<number>;
    seekListeners: SeekListeners;
    seekBarSelector?: string;
    intervalSec: number;
    height: number;
    imageCache: Record<number, HTMLImageElement>;
    thumbUrlFn: (sec: number) => string;
  }
): void => {
  const {
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
  } = deps;

  if (!mountedRef.current || !videoRef.current) return;
  const canvasLocal = canvasMgr.getCanvas();
  if (!canvasLocal) return;

  lastMoveTsRef.current = Date.now();

  const seekElLocal =
    (seekListeners as any).boundSeekRef?.current ?? findSeekEl(seekBarSelector);
  // mount canvas into the same body/root as seekElLocal if found (handles portals)
  if (canvasLocal && seekElLocal) {
    const seekRoot = seekElLocal.ownerDocument?.body ?? getMountRoot();
    if (canvasLocal.parentElement !== seekRoot) {
      try {
        mountCanvasInto(canvasLocal, seekRoot);
      } catch {}
    }
  }

  const rect = safeMeasureRect(seekElLocal, videoRef);
  if (!rect) return;

  const mouseX = ev.clientX;
  const relX = Math.max(0, Math.min(mouseX - rect.left, rect.width));
  const percent = rect.width > 0 ? relX / rect.width : 0;
  const duration = Math.max(0, videoRef.current.duration || intervalSec * 10);
  const sec = Math.floor(percent * duration);
  const thumbSec = Math.floor(sec / intervalSec) * intervalSec;

  const pos = computeCanvasPosition(rect, {
    root: getMountRoot(),
    seekEl: seekElLocal,
    canvasHeightPx: height,
    gapPx: 8,
  });
  const left = pos.left + relX;
  const top = pos.top;

  // center horizontally with CSS transform
  canvasLocal.style.left = `${left}px`;
  canvasLocal.style.top = `${top}px`;
  canvasLocal.style.transform = "translate(-50%, -100%)";
  canvasLocal.style.transformOrigin = "50% 100%";

  canvasMgr.show();

  const ctx = canvasLocal.getContext("2d");
  if (!ctx) return;
  if (imageCache[thumbSec]) {
    ctx.clearRect(0, 0, canvasLocal.width, canvasLocal.height);
    ctx.drawImage(
      imageCache[thumbSec],
      0,
      0,
      canvasLocal.width,
      canvasLocal.height
    );
    return;
  }
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    imageCache[thumbSec] = img;
    ctx.clearRect(0, 0, canvasLocal.width, canvasLocal.height);
    ctx.drawImage(img, 0, 0, canvasLocal.width, canvasLocal.height);
  };
  img.src = thumbUrlFn(thumbSec);
};

export function refreshMountedRoot(
  internalRef: React.RefObject<HTMLCanvasElement | null>,
  mountedRootRef: React.RefObject<HTMLElement | null>
): void {
  const node = internalRef.current;
  if (!node) return;
  const curParent = node.parentElement ?? null;
  if (curParent !== mountedRootRef.current) {
    try {
      console.info("refreshMountedRoot: parent changed", {
        prev: mountedRootRef.current,
        now: curParent,
        inFullscreen: !!document.fullscreenElement,
      });
    } catch {}
    mountedRootRef.current = curParent;
  }
}
