"use client";

import NavButton from "@/features/components/shared/Button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-cobalt-900 text-center px-4">
      <h1 className="text-4xl font-bold text-red-500 mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-700 dark:text-white mb-6">
        Looks like this page doesn’t exist. You can go back to where you came
        from, or head home.
      </p>

      <div className="flex flex-row items-center">
        <NavButton label="go home" onClick={() => router.push("/")} />
        or
        <NavButton label="go back" onClick={() => router.back()} />
      </div>
    </div>
  );
}
