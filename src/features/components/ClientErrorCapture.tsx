"use client";
import { useEffect } from "react";

export default function ClientFullscreenGuard() {
  console.log("function ClientFullscreenGuard() ");
  useEffect(() => {
    const origReq = Element.prototype.requestFullscreen;
    Element.prototype.requestFullscreen = function (
      ...args: [FullscreenOptions?]
    ) {
      try {
        return origReq.apply(this, args as any);
      } catch (err) {
        console.warn("requestFullscreen suppressed", err);
        return Promise.reject(err);
      }
    };
    const origExit = document.exitFullscreen?.bind(document);
    if (origExit) {
      document.exitFullscreen = function () {
        try {
          if (!document.fullscreenElement) return Promise.resolve();
          return origExit();
        } catch (err) {
          console.warn("exitFullscreen suppressed", err);
          return Promise.resolve();
        }
      };
    }
    return () => {
      Element.prototype.requestFullscreen = origReq;
      if (origExit) document.exitFullscreen = origExit;
    };
  }, []);
  return null;
}
