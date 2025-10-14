// hooks/useCurrentUser.ts
import { useQuery } from "@tanstack/react-query";
import { User } from "@/features/types";
import { api } from "@/features/lib/api";

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await api.get<User>("/users/me");
      return res.data;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
