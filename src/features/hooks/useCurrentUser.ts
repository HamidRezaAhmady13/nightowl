import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@/features/types";
// import { api } from "@/app/lib/api";
import { useRouter, usePathname } from "next/navigation";
import api from "../lib/api";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const win = window as any;
  if (win.__ACCESS_TOKEN__) return String(win.__ACCESS_TOKEN__);

  try {
    let ls = localStorage.getItem("token") || localStorage.getItem("access");
    if (ls) {
      if (ls === "[object Object]") {
        try {
          localStorage.removeItem("token");
        } catch (e) {}
        return null;
      }
      if (ls.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(ls);
          const maybe =
            parsed?.token ||
            parsed?.accessToken ||
            parsed?.access ||
            parsed?.value;
          if (typeof maybe === "string") return maybe;
          return String(maybe ?? ls);
        } catch (e) {
          return ls;
        }
      }
      return ls;
    }
  } catch (e) {}

  return null;
}

export function useCurrentUser() {
  const token = getAccessToken();
  const router = useRouter();
  const path = usePathname();
  const queryClient = useQueryClient();
  return useQuery<User | null>({
    queryKey: ["currentUser", token],
    queryFn: async () => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await api.get<User>("/users/me", { headers });

      return res.data;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!token, // Only run if token exists
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
}
