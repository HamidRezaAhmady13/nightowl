// features/hooks/useCanvasManager.ts
import { useEffect, useRef } from "react";
import { getMountRoot, mountCanvasInto } from "./hoverThumbnailUtils";

export type CanvasManager = {
  getCanvas: () => HTMLCanvasElement | null;
  show: () => void;
  hide: (immediate?: boolean) => void;
  scheduleHide: (holdMs?: number) => void;
  setSize: (w: number, h: number) => void;
};

export function useCanvasManager(
  providedRef: React.RefObject<HTMLCanvasElement | null>,
  opts: { width: number; height: number; zIndex?: number } = {
    width: 160,
    height: 90,
  }
): CanvasManager {
  const internalRef = useRef<HTMLCanvasElement | null>(null);
  const hideTimer = useRef<number | null>(null);
  const dprRef = useRef<number>(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  );

  const getCanvas = () => internalRef.current ?? providedRef?.current ?? null;

  const setSize = (w: number, h: number) => {
    const canvas = getCanvas();
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const show = () => {
    const c = getCanvas();
    if (!c) return;
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    c.style.visibility = "visible";
    c.style.opacity = "1";
    c.style.pointerEvents = "none";
  };

  const hide = (immediate = false) => {
    const c = getCanvas();
    if (!c) return;
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (immediate) {
      c.style.opacity = "0";
      c.style.visibility = "hidden";
      return;
    }
    c.style.opacity = "0";
    c.style.visibility = "hidden";
  };

  const scheduleHide = (holdMs = 700) => {
    const c = getCanvas();
    if (!c) return;
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      c.style.opacity = "0";
      c.style.visibility = "hidden";
      hideTimer.current = null;
    }, holdMs) as unknown as number;
  };

  useEffect(() => {
    // prefer provided canvasRef if supplied; otherwise create internal canvas
    let created = false;
    let canvas = getCanvas();
    if (!canvas) {
      canvas = document.createElement("canvas");
      internalRef.current = canvas;
      created = true;
    }

    // initial sizing and base styles
    setSize(opts.width, opts.height);
    canvas.style.visibility = "hidden";
    canvas.style.opacity = "0";
    canvas.style.transition = "opacity 120ms linear";
    canvas.style.transform = "translate(-50%, -100%)";
    canvas.style.transformOrigin = "50% 100%";
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.zIndex = String(opts.zIndex ?? 999999);
    canvas.style.pointerEvents = "none";

    // mount only if we created the node (avoid moving React-owned nodes)
    if (created && canvas) mountCanvasInto(canvas, getMountRoot());

    return () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      if (created && internalRef.current) {
        const p = internalRef.current.parentElement;
        if (p && p.contains(internalRef.current)) {
          try {
            p.removeChild(internalRef.current);
          } catch {}
        }
        internalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providedRef, opts.width, opts.height]);

  return { getCanvas, show, hide, scheduleHide, setSize };
}
