"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useClickOutside } from "@/features/hooks/useClickOutside";
import { usePathname } from "next/navigation";
import { useModalStack } from "@/features/hooks/useModalStack";

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  ariaLabel?: string;
};

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

export default function PostModal({
  children,
  onClose,
  ariaLabel = "Dialog",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const prevOverflowRef = useRef<string>("");
  const pathname = usePathname();
  useModalStack(() => onClose());

  function restoreBodyOverflow() {
    // restore only if we previously modified it
    if (prevOverflowRef.current !== undefined) {
      document.body.style.overflow = prevOverflowRef.current || "";
      prevOverflowRef.current = "";
    }
  }

  useLayoutEffect(() => {
    // save previous overflow and set hidden immediately
    prevOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      restoreBodyOverflow();
    };
  }, []); // run once on mount/unmount

  useEffect(() => {
    return () => {
      restoreBodyOverflow();
    };
  }, [pathname]);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const focusable =
      dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    focusable?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const nodes =
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!nodes || nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus();
    };
  }, [onClose]);

  useClickOutside(dialogRef as React.RefObject<HTMLElement>, onClose);

  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const modal = (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayMouseDown}
      className="fixed inset-0 z-50 u-flex-center p-lg  "
      aria-modal="true"
      role="presentation"
      // style={{ position: "fixed", zIndex: 999999 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      {/* max-h-[44vh] mt-md */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-label={ariaLabel}
        onPointerDown={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-4xl u-bg-deep rounded-md shadow-lg  "
        style={{
          maxHeight: "100vh",
          minHeight: "95vh",
        }}
      >
        <div className="p-md">
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute right-md top-md rounded p-xs u-text-lg u-text-secondary-soft focus:outline-none "
          >
            ✕
          </button>{" "}
          <div className="px-md      overflow-auto " style={{ flex: 1 }}>
            <div className="  ">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return ReactDOM.createPortal(modal, document.body);
}
