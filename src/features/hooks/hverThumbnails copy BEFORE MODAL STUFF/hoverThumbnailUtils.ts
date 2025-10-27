export const getMountRoot = (): HTMLElement =>
  document.fullscreenElement &&
  document.fullscreenElement instanceof HTMLElement
    ? (document.fullscreenElement as HTMLElement)
    : document.body;

export const findSeekEl = (seekBarSelector?: string): HTMLElement | null => {
  const root = getMountRoot();
  if (!seekBarSelector) return null;
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

  // already in correct root: ensure consistent positioning and transforms
  if (canvas.parentElement === target) {
    canvas.style.position = target === document.body ? "fixed" : "absolute";
    canvas.style.transform = "translate(-50%, -100%)";
    canvas.style.transformOrigin = "50% 100%";
    return;
  }

  // safely remove from previous parent if present
  const parent = canvas.parentElement;
  if (parent && parent.contains(canvas)) {
    try {
      parent.removeChild(canvas);
    } catch {
      /* ignore */
    }
  }

  canvas.style.position = target === document.body ? "fixed" : "absolute";
  canvas.style.transform = "translate(-50%, -100%)";
  canvas.style.transformOrigin = "50% 100%";
  try {
    if (!target.contains(canvas)) target.appendChild(canvas);
  } catch {
    /* ignore */
  }
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
  el?: HTMLElement | null
): boolean => {
  if (!el) return false;
  const topEl = document.elementFromPoint(x, y) as HTMLElement | null;
  if (!topEl) return false;
  return el.contains(topEl) || el === topEl;
};
