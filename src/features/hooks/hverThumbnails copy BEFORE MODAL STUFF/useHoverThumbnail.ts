// // features/hooks/useHoverThumbnail.ts
// import { RefObject, useEffect } from "react";
// import { useCanvasManager } from "./useCanvasManager";
// import { useSeekHoverListeners } from "./useSeekHoverListeners";
// import {
//   computeCanvasPosition,
//   getMountRoot,
//   measureSeekRect,
// } from "./hoverThumbnailUtils";

// type Params = {
//   videoRef: RefObject<HTMLVideoElement | null>;
//   canvasRef: RefObject<HTMLCanvasElement | null>;
//   thumbUrlFn: (sec: number) => string;
//   seekBarSelector?: string;
//   intervalSec?: number;
//   width?: number;
//   height?: number;
//   imageCache?: Record<number, HTMLImageElement>;
// };

// export function useHoverThumbnail({
//   videoRef,
//   canvasRef,
//   thumbUrlFn,
//   seekBarSelector,
//   intervalSec = 30,
//   width = 160,
//   height = 90,
//   imageCache = {},
// }: Params) {
//   const canvasMgr = useCanvasManager(canvasRef, { width, height });
//   const seekListeners = useSeekHoverListeners(seekBarSelector);

//   useEffect(() => {
//     const canvas = canvasMgr.getCanvas();
//     if (!canvas || !videoRef?.current) return;
//     let mounted = true;

//     const onMove = (ev: MouseEvent) => {
//       console.log({
//         root: getMountRoot(),
//         rectTop: rect.top,
//         rectBottom: rect.bottom,
//         rectHeight: rect.height,
//         leftStyle: canvas.style.left,
//         topStyle: canvas.style.top,
//       });

//       if (!mounted || !videoRef.current) return;
//       // const seekEl =
//       //   seekListeners.boundSeekRef.current ??
//       //   seekListeners.boundSeekRef.current ??
//       //   null;
//       const seekEl = seekListeners.boundSeekRef.current ?? null;

//       const rect =
//         measureSeekRect(seekEl) ?? videoRef.current.getBoundingClientRect();

//       if (!rect) return;
//       const mouseX = ev.clientX;
//       const relX = Math.max(0, Math.min(mouseX - rect.left, rect.width));
//       const percent = rect.width > 0 ? relX / rect.width : 0;
//       const duration = Math.max(
//         0,
//         videoRef.current.duration || intervalSec * 10
//       );
//       const sec = Math.floor(percent * duration);
//       const thumbSec = Math.floor(sec / intervalSec) * intervalSec;

//       const pos = computeCanvasPosition(rect, {
//         root: getMountRoot(),
//         seekEl: seekElLocal,
//         canvasHeightPx: height,
//         gapPx: 8,
//       });

//       const left = pos.left + relX;
//       const top = pos.top;
//       canvas.style.left = `${left}px`;
//       canvas.style.top = `${top}px`;
//       canvas.style.border = `1px solid red`;

//       canvasMgr.show();
//       // draw thumb
//       const ctx = canvas.getContext("2d");
//       if (!ctx) return;
//       if (imageCache[thumbSec]) {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.drawImage(imageCache[thumbSec], 0, 0, canvas.width, canvas.height);
//         return;
//       }
//       const img = new Image();
//       img.crossOrigin = "anonymous";
//       img.onload = () => {
//         imageCache[thumbSec] = img;
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//       };
//       img.src = thumbUrlFn(thumbSec);
//     };

//     const seekEl =
//       seekListeners.boundSeekRef.current ??
//       seekListeners.boundSeekRef.current ??
//       null;
//     if (seekEl) {
//       seekEl.addEventListener("mousemove", onMove);
//     } else {
//       // fallback: listen to document mousemove and compute using video rect
//       document.addEventListener("mousemove", onMove);
//     }

//     return () => {
//       mounted = false;
//       if (seekEl) {
//         seekEl.removeEventListener("mousemove", onMove);
//       } else {
//         document.removeEventListener("mousemove", onMove);
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     canvasMgr,
//     seekListeners,
//     videoRef,
//     thumbUrlFn,
//     intervalSec,
//     width,
//     height,
//     imageCache,
//   ]);
// }

// features/hooks/useHoverThumbnail.ts
import { RefObject, useEffect, useRef } from "react";
import { useCanvasManager } from "./useCanvasManager";
import { useSeekHoverListeners } from "./useSeekHoverListeners";
import {
  computeCanvasPosition,
  findSeekEl,
  getMountRoot,
  isOverElement,
  measureSeekRect,
  mountCanvasInto,
} from "./hoverThumbnailUtils";

type Params = {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  thumbUrlFn: (sec: number) => string;
  seekBarSelector?: string;
  intervalSec?: number;
  width?: number;
  height?: number;
  imageCache?: Record<number, HTMLImageElement>;
};

export function useHoverThumbnail({
  videoRef,
  canvasRef,
  thumbUrlFn,
  seekBarSelector,
  intervalSec = 30,
  width = 160,
  height = 90,
  imageCache = {},
}: Params) {
  const canvasMgr = useCanvasManager(canvasRef, { width, height });

  const seekListeners = useSeekHoverListeners(seekBarSelector);
  const lastMoveTsRef = useRef<number>(0);
  const HIDE_HOLD_MS = 700;
  const HEARTBEAT_MS = 300;

  useEffect(() => {
    const canvas = canvasMgr.getCanvas();

    if (!canvas || !videoRef?.current) return;
    let mounted = true;

    // inside the effect that sets up pointer handlers
    const pointerOutHandler = (e?: PointerEvent) => {
      const canvas = canvasMgr.getCanvas();
      const seekElLocal =
        (seekListeners as any).boundSeekRef?.current ??
        findSeekEl(seekBarSelector);
      //
      //AFTER ALL ARE CORRECT JUST FOR MODAL!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // if (canvas && seekElLocal) {
      //   const seekRoot = seekElLocal.ownerDocument?.body ?? getMountRoot();
      //   // mountCanvasInto accepts optional root param in utils; call through canvas manager if you prefer
      //   mountCanvasInto(canvas, seekRoot);
      // }
      //AFTER ALL ARE CORRECT JUST FOR MODAL!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      //
      const overSeek = seekElLocal
        ? isOverElement(e?.clientX ?? 0, e?.clientY ?? 0, seekElLocal)
        : false;
      const overCanvas = canvas
        ? isOverElement(e?.clientX ?? 0, e?.clientY ?? 0, canvas)
        : false;
      if (overSeek || overCanvas) return;
      if (canvas) canvasMgr.scheduleHide(HIDE_HOLD_MS);
    };
    document.addEventListener("pointerout", pointerOutHandler);

    const onMove = (ev: MouseEvent) => {
      if (!mounted || !videoRef.current) return;
      const canvas = canvasMgr.getCanvas();
      if (!canvas) return;
      lastMoveTsRef.current = Date.now();

      // find the freshest seek element (prefer bound one)
      const seekElLocal =
        (seekListeners as any).boundSeekRef?.current ??
        findSeekEl(seekBarSelector);
      const rect =
        measureSeekRect(seekElLocal) ??
        videoRef.current.getBoundingClientRect();
      if (!rect) return;

      console.log("hover preview:", {
        seekElLocal,
        canvasParent: canvas.parentElement,
        rectTop: rect.top,
        rectLeft: rect.left,
      });

      const mouseX = ev.clientX;
      const relX = Math.max(0, Math.min(mouseX - rect.left, rect.width));
      const percent = rect.width > 0 ? relX / rect.width : 0;
      const duration = Math.max(
        0,
        videoRef.current.duration || intervalSec * 10
      );
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
      canvas.style.left = `${left}px`;
      canvas.style.top = `${top}px`;
      canvas.style.border = `1px solid red`;
      canvas.style.borderRadius = `5px  `;
      canvas.style.transform = "translate(-50%, -20%)";
      canvas.style.transformOrigin = "50% 100%";

      canvasMgr.show();

      // draw or reuse cached image
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (imageCache[thumbSec]) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageCache[thumbSec], 0, 0, canvas.width, canvas.height);
        return;
      }
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageCache[thumbSec] = img;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = thumbUrlFn(thumbSec);
    };

    // attach to the active seek element if found, otherwise listen document-wide
    const currentSeek =
      (seekListeners as any).boundSeekRef?.current ??
      findSeekEl(seekBarSelector);
    if (currentSeek) {
      currentSeek.addEventListener("mousemove", onMove);
    } else {
      document.addEventListener("mousemove", onMove);
    }

    return () => {
      mounted = false;
      if (currentSeek) currentSeek.removeEventListener("mousemove", onMove);
      else document.removeEventListener("mousemove", onMove);
    };
    // intentionally omit deep objects from deps; this hook responds to runtime DOM
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
