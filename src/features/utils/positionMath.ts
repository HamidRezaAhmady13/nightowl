import { clampPosition, snapTime } from "./thumbnailMath";

// positionMath.ts
export function getSnappedTime(
  e: MouseEvent,
  bar: HTMLElement,
  duration: number,
  intervalSec: number
) {
  // const rect = bar.getBoundingClientRect();
  // const percent = (e.clientX - rect.left) / rect.width;
  // const hoveredTime = percent * duration;
  // return snapTime(hoveredTime, intervalSec);
  const rect = bar.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const hoveredTime = percent * duration;

  const snapped = Math.floor(hoveredTime / intervalSec) * intervalSec;
  const lastThumb = Math.floor(duration / intervalSec) * intervalSec;

  return Math.min(snapped, lastThumb);
}

export function positionCanvas(
  canvas: HTMLCanvasElement,
  e: MouseEvent,
  width: number,
  height: number,
  barTop: number
) {
  canvas.style.left = `${clampPosition(e.clientX, width, window.innerWidth)}px`;
  canvas.style.top = `${Math.max(0, barTop - height - 8)}px`;
}
