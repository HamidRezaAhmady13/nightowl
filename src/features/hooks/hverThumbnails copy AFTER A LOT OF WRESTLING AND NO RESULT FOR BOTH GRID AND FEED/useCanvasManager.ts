import { useEffect, useRef } from "react";
import type { CanvasManager } from "./canvas.types";
import {
  setSize,
  show,
  hide,
  scheduleHide,
  mountIntoRoot,
  DprRef,
  HideTimerRef,
  getMountRoot,
  refreshMountedRoot,
} from "./hoverThumbnailUtils";

export function useCanvasManager(
  providedRef: React.RefObject<HTMLCanvasElement | null>,
  opts: { width: number; height: number; zIndex?: number } = {
    width: 160,
    height: 90,
  }
): CanvasManager {
  const internalRef = useRef<HTMLCanvasElement | null>(null);
  const createdRef = useRef<boolean>(false);
  const hideTimerRef = useRef<number | null>(null) as HideTimerRef;
  const dprRef = useRef<number>(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  ) as DprRef;
  const mountedRootRef = useRef<HTMLElement | null>(null);

  const getCanvas = () => internalRef.current ?? providedRef?.current ?? null;

  const apiSetSize = (w: number, h: number) =>
    setSize(getCanvas(), w, h, dprRef);
  const apiShow = () => show(getCanvas(), hideTimerRef);
  const apiHide = (immediate = false) =>
    hide(getCanvas(), hideTimerRef, immediate);
  const apiScheduleHide = (holdMs = 700) =>
    scheduleHide(getCanvas(), hideTimerRef, holdMs);
  const apiMountIntoRoot = (root?: HTMLElement) => {
    // only reparent the internal canvas (the one manager created)
    const internal = internalRef.current;
    if (internal) {
      mountIntoRoot(internal, root ?? getMountRoot());
      mountedRootRef.current = internal.parentElement ?? null;
      return;
    }
    // for providedRef (React-owned) do not move node; just ensure style
    const provided = providedRef?.current ?? null;
    if (provided) {
      mountedRootRef.current = provided.parentElement ?? null;
      const styleParent = mountedRootRef.current;
      if (styleParent) {
        provided.style.position =
          styleParent === document.body ? "fixed" : "absolute";
        provided.style.transform = "translate(-50%, -100%)";
        provided.style.transformOrigin = "50% 100%";
      }
    }
  };

  useEffect(() => {
    let created = false;
    let canvas = getCanvas();
    if (!canvas) {
      canvas = document.createElement("canvas");
      internalRef.current = canvas;
      createdRef.current = true;
      created = true;
    }

    apiSetSize(opts.width, opts.height);

    canvas.style.visibility = "hidden";
    canvas.style.opacity = "0";
    canvas.style.transition = "opacity 120ms linear";
    canvas.style.transform = "translate(-50%, -100%)";
    canvas.style.transformOrigin = "50% 100%";
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.zIndex = String(opts.zIndex ?? 999999);
    canvas.style.pointerEvents = "none";

    const runRefresh = () => refreshMountedRoot(internalRef, mountedRootRef);

    const onFsChange = () => runRefresh();
    document.addEventListener("fullscreenchange", onFsChange);

    const pollId = window.setInterval(runRefresh, 200);

    const delayedId = window.setTimeout(runRefresh, 500);

    const dpr =
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    dprRef.current = dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // if (created && canvas) {
    //   try {
    //     mountIntoRoot(canvas, getMountRoot());
    //     mountedRootRef.current = canvas.parentElement ?? null;
    //   } catch {}
    // } else if (!created) {
    //   const provided = providedRef?.current ?? null;
    //   if (provided) mountedRootRef.current = provided.parentElement ?? null;
    // }
    if (created && canvas) {
      try {
        mountIntoRoot(canvas, getMountRoot());
        mountedRootRef.current = canvas.parentElement ?? null;
      } catch {}
    } else {
      // using React-owned canvas — never reparent or call mountIntoRoot
      const provided = providedRef?.current ?? null;
      if (provided) mountedRootRef.current = provided.parentElement ?? null;
    }

    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      window.clearInterval(pollId);
      window.clearTimeout(delayedId);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      // only remove the internal manager-created canvas; never touch providedRef
      if (createdRef.current && internalRef.current) {
        const node = internalRef.current;
        const recordedParent = mountedRootRef.current;
        if (recordedParent && recordedParent.contains(node)) {
          try {
            recordedParent.removeChild(node);
          } catch {}
        } else {
          const curParent = node.parentElement;
          if (curParent && curParent.contains(node)) {
            try {
              curParent.removeChild(node);
            } catch {}
          }
        }
        internalRef.current = null;
        createdRef.current = false;
        mountedRootRef.current = null;
      }
    };
  }, [providedRef, opts.width, opts.height]);

  return {
    getCanvas,
    show: apiShow,
    hide: apiHide,
    scheduleHide: apiScheduleHide,
    setSize: apiSetSize,
    mountIntoRoot: apiMountIntoRoot,
  };
}
