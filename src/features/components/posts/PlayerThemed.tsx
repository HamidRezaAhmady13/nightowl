"use client";

import React, { useEffect } from "react";
import { Player, type PlayerProps } from "react-tuby";

type ThemedColor = string | undefined;

function parseThemeColor(
  s: ThemedColor,
  isDark: boolean,
  fallback = "#ffa000"
) {
  if (!s) return fallback;
  const raw = s.trim();

  // CSS var reference: "var(--player-accent)"
  if (/^var\(.+\)$/.test(raw)) return raw;

  // DSL: dark:#hex lightHex or "dark:#hex lightHex"
  const darkPrefix = raw.match(/dark:([#A-Za-z0-9]+)/);
  if (darkPrefix) {
    const dark = darkPrefix[1];
    const rest = raw.replace(darkPrefix[0], "").trim();
    const light = rest.split(/\s+/).filter(Boolean)[0] ?? fallback;
    return isDark ? dark : light;
  }

  // two tokens: dark light
  const tokens = raw.split(/\s+/).filter(Boolean);
  if (tokens.length === 2) {
    const [dark, light] = tokens;
    return isDark ? dark : light;
  }
  if (tokens.length === 1) return tokens[0] || fallback;
  return fallback;
}

export type PlayerThemedProps = Omit<PlayerProps, "primaryColor"> & {
  themed?: ThemedColor; // DSL or CSS var
  isDark: boolean;
  fallback?: string;
};

export default function PlayerThemed({
  themed,
  isDark,
  fallback = "#ffa000",
  ...playerProps
}: PlayerThemedProps) {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  const primaryRaw = React.useMemo(
    () => parseThemeColor(themed, isDark, fallback),
    [themed, isDark, fallback]
  );

  // resolvedPrimary: if themed is a CSS var (eg `var(--player-accent)`),
  // read the computed value and keep it in state so we can update when
  // the root inline style changes (theme toggle updates the inline style).
  const [resolvedPrimary, setResolvedPrimary] = React.useState(() => {
    if (/^var\(.+\)$/.test(primaryRaw)) {
      if (typeof window === "undefined") return fallback;
      const varName = primaryRaw
        .replace(/^var\(/, "")
        .replace(/\)$/, "")
        .trim();
      const val = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      return val || fallback;
    }
    return primaryRaw;
  });

  // Observe inline style changes on documentElement so we re-read the CSS var
  // whenever `document.documentElement.style.setProperty('--player-accent', ...)` runs.
  useEffect(() => {
    if (!/^var\(.+\)$/.test(primaryRaw)) return;
    if (typeof window === "undefined") return;

    const varName = primaryRaw
      .replace(/^var\(/, "")
      .replace(/\)$/, "")
      .trim();
    const read = () =>
      (
        getComputedStyle(document.documentElement).getPropertyValue(varName) ||
        ""
      ).trim() || fallback;

    // set initial
    setResolvedPrimary(read());

    // monitor inline style attribute changes on <html>
    const mo = new MutationObserver(() => {
      const v = read();
      setResolvedPrimary((prev) => (prev !== v ? v : prev));
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    // also listen to storage in case theme persistence uses localStorage elsewhere
    const onStorage = () => {
      const v = read();
      setResolvedPrimary((prev) => (prev !== v ? v : prev));
    };
    window.addEventListener("storage", onStorage);

    return () => {
      mo.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, [primaryRaw, fallback]);

  // Apply CSS var to wrapper and aggressively update tuby nodes
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    // set CSS variable on wrapper
    (el.style as any).setProperty("--player-accent", resolvedPrimary);

    // Update react-tuby rendered nodes immediately (progress, thumb, track)
    const updateSelectors = [
      ".tuby-seek-bar .tuby-progress",
      ".tuby-seek-bar .thumb",
      ".tuby-seek-bar .track",
      ".tuby-volume .tuby-progress",
    ];
    updateSelectors.forEach((sel) => {
      el.querySelectorAll<HTMLElement>(sel).forEach((node) => {
        // node.style.setProperty("background", resolvedPrimary, "important");
        node.style.setProperty("color", resolvedPrimary, "important");
        // sometimes tuby uses box-shadow or border
        node.style.setProperty("border-color", resolvedPrimary, "important");
      });
    });
  }, [resolvedPrimary]);

  // pass a concrete color to Player.primaryColor (not a var), so Player's internal render uses it too
  const primaryForPlayer = resolvedPrimary;

  return (
    <div
      ref={wrapperRef}
      className="player-themed-wrapper"
      style={{ ["--player-accent" as any]: resolvedPrimary }}
    >
      <Player
        {...(playerProps as PlayerProps)}
        // primaryColor="var(--player-accent)"
        primaryColor={primaryForPlayer}
      />
    </div>
  );
}
