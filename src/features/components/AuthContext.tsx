// AuthContext.tsx
"use client";
import { createContext, useContext } from "react";
import { User } from "../types";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
};
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  token,
  children,
}: {
  token?: string;
  children: React.ReactNode;
}) {
  const { data, isLoading } = useQuery<User | null>({
    queryKey: ["currentUser", token],
    queryFn: async () => {
      if (!token) return null;
      const headers = { Authorization: `Bearer ${token}` };
      const res = await api.get<User>("/users/me", { headers });
      return res.data;
    },
    enabled: !!token,
    staleTime: 1000 * 60, // cache for 1 min
  });

  return (
    <AuthContext.Provider value={{ user: data ?? null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useCurrentUser must be used inside <AuthProvider>");
  return ctx;
}
