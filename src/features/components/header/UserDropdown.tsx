"use client";

import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useLogout } from "@/features/hooks/useLogout";
import { useUpdateTheme } from "@/features/hooks/useUpdateTheme";
import { api } from "@/features/lib/api";
import Button from "../shared/Button";
import { updatePlayerAccent } from "@/features/utils/updateAccent";
import { observePlayersAndApplyAccent } from "@/features/utils/observePlayers";

function UserDropdown() {
  const router = useRouter();
  const { handleLogout } = useLogout();
  const [isDark, setIsDark] = useState(false);
  const { mutate: updateTheme } = useUpdateTheme();
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => api.get("/users/me").then((res) => res.data),
  });

  // run observer once on mount and clean up
  // useEffect(() => {
  //   const stop = observePlayersAndApplyAccent(); // returns cleanup
  //   return () => stop();
  // }, []);

  // // initialize isDark and ensure root var synced
  // useEffect(() => {
  //   const theme =
  //     document.cookie
  //       .split("; ")
  //       .find((c) => c.startsWith("theme="))
  //       ?.split("=")[1] ||
  //     (document.documentElement.classList.contains("dark") ? "dark" : "light");
  //   const dark = theme === "dark";
  //   setIsDark(dark);

  //   const color = dark ? "#4f46e5" : "#ffa000";
  //   document.documentElement.classList.toggle("dark", dark);
  //   document.documentElement.style.setProperty("--player-accent", color);
  //   document.documentElement.style.setProperty("--tuby-primary-color", color);
  //   // ensure any already-mounted players repaint
  //   updatePlayerAccent(color);
  // }, []);

  useEffect(() => {
    const stop = observePlayersAndApplyAccent();
    return () => stop();
  }, []);

  useEffect(() => {
    const theme =
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("theme="))
        ?.split("=")[1] ??
      (document.documentElement.classList.contains("dark") ? "dark" : "light");
    const dark = theme === "dark";
    const color = dark ? "#4f46e5" : "#ffa000";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.setProperty(
      "--player-accent",
      color,
      "important"
    );
    document.documentElement.style.setProperty(
      "--tuby-primary-color",
      color,
      "important"
    );
    document.querySelectorAll(".tuby").forEach((n) => {
      if (n instanceof HTMLElement)
        n.style.setProperty("--tuby-primary-color", color, "important");
    });
    updatePlayerAccent(color);
    setIsDark(dark);
  }, []);

  const toggleTheme = () => {
    // compute from DOM (stateless) for maximum reliability
    const currentlyDark = document.documentElement.classList.contains("dark");
    const newTheme = currentlyDark ? "light" : "dark";
    const color = newTheme === "dark" ? "#4f46e5" : "#ffa000";

    // immediate UI update
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    document.documentElement.style.setProperty("--player-accent", color);

    document.documentElement.style.setProperty("--tuby-primary-color", color);
    updatePlayerAccent(color);

    // persist
    document.cookie = `theme=${newTheme}; path=/; SameSite=lax`;
    updateTheme(newTheme); // fire-and-forget; add error handling if you want

    document.querySelectorAll(".tuby-seek-bar .tuby-progress").forEach((n) => {
      // if (n instanceof HTMLElement)
      // n.style.setProperty("background", color, "important");
    });

    // keep local state in sync for button label
    setIsDark(newTheme === "dark");
  };

  return (
    <div
      className={clsx(
        "absolute left-0 top-full mt-0 w-full",
        "u-bg-transparent",
        "u-flex-center flex-col shadow-lg rounded p-2 z-10 ",
        "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
        "group-focus-within:opacity-100 group-focus-within:pointer-events-auto ",
        "transition-opacity duration-fast"
      )}
      tabIndex={-1}
    >
      <Button
        label="HOME"
        onClick={() => router.push(`/feed`)}
        className="w-full"
        size={"lg"}
        height={"md"}
      />
      <Button
        label="Share post"
        onClick={() => router.push(`/post`)}
        className="w-full"
        size={"md"}
        height={"md"}
      />
      <Button
        label="Profile"
        onClick={() =>
          currentUser && router.push(`/users/${currentUser.username}`)
        }
        className="w-full"
        size={"md"}
        height={"md"}
      />
      <Button
        label="Logout"
        onClick={handleLogout}
        className="w-full"
        size={"md"}
        height={"md"}
      />
      <Button
        className="w-full"
        onClick={toggleTheme}
        size={"md"}
        height={"md"}
      >
        {isDark ? "Light" : "Dark"}
      </Button>
    </div>
  );
}

export default UserDropdown;
