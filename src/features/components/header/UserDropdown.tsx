import { useRouter } from "next/navigation";
import clsx from "clsx";

import Button from "../shared/Button";
import { useLogout } from "@/features/hooks/useLogout";
import { useEffect, useState } from "react";
import { useUpdateTheme } from "@/features/hooks/useUpdateTheme";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/features/lib/api";

function UserDropdown() {
  const router = useRouter();
  const { handleLogout } = useLogout();
  const [isDark, setIsDark] = useState(false);
  const { mutate: updateTheme } = useUpdateTheme();
  const { data: currentUser, refetch: refetchCurrentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => api.get("/users/me").then((res) => res.data),
  });
  useEffect(() => {
    const theme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    setIsDark(theme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    setIsDark(!isDark);
    updateTheme(newTheme);
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
      // allow keyboard focus inside the dropdown
      tabIndex={-1}
    >
      <Button
        label="HOME"
        onClick={() => router.push(`/feed`)}
        className="w-full  "
        size={"lg"}
        height={"md"}
      />{" "}
      <Button
        label="Share post"
        onClick={() => router.push(`/post`)}
        className="w-full"
        size={"md"}
        height={"md"}
      />
      <Button
        label="Profile"
        onClick={() => router.push(`/users/${currentUser.username}`)}
        className="w-full  "
        size={"md"}
        height={"md"}
      />{" "}
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
