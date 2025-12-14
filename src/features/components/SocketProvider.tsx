"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import type {
  NotificationFeedPage,
  BackendNotificationEntity,
} from "../types/notification.types"; // <- import the canonical types
// import { toNotification } from "../../app/utils/dateUtils";
import { useRouter } from "next/navigation";
import { showSimpleToast } from "./ntfToast";
import { toNotification } from "@/features/utils/dateUtils";

type SocketContextValue = { socket: Socket | null; connected: boolean };
const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});
export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({
  children,
  url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
  token,
  userId,
}: {
  children: React.ReactNode;
  url?: string;
  token?: string | null;
  userId?: string | null;
}) {
  const seen = useRef(new Set<string>());
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();
  const authToken =
    token ??
    (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  // console.log(authToken);

  useEffect(() => {
    if (socketRef.current) return;
    const s = io(url, {
      auth: { token: authToken },
      withCredentials: true,
      autoConnect: true,
    });
    socketRef.current = s;

    const handleConnect = () => {
      setConnected(true);
      if (authToken) s.emit("auth", { token: authToken });
    };
    const handleDisconnect = () => setConnected(false);
    const handleConnectError = (err: any) => {
      console.warn("socket connect_error", err?.message ?? err);
      setConnected(false);
    };

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.on("connect_error", handleConnectError);

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("connect_error", handleConnectError);
      s.close();
      socketRef.current = null;
    };
  }, [url, authToken]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const onNotification = (raw: BackendNotificationEntity) => {
      const ntf = toNotification(raw);

      const key = ["notifications", userId ?? null] as const;
      queryClient.setQueryData<NotificationFeedPage | undefined>(
        key,
        (prev) => {
          if (!prev) {
            return { items: [ntf], total: 1 };
          }
          return {
            ...prev,
            items: [ntf, ...prev.items],
            total: prev.total + 1,
          };
        }
      );
      const unreadKey = [
        "notifications",
        userId ?? null,
        "unreadCount",
      ] as const;
      queryClient.setQueryData<number | undefined>(
        unreadKey,
        (prev) => (prev ?? 0) + 1
      );

      if (!seen.current.has(ntf.id)) {
        seen.current.add(ntf.id);
        showSimpleToast(ntf, router);
      }
    };

    const onUnreadCount = (payload: { unread: number }) => {
      const key = ["notifications", userId ?? null, "unreadCount"] as const;
      queryClient.setQueryData<number | undefined>(key, () => payload.unread);
    };

    s.on("notification", onNotification);
    s.on("notifications:unreadCount", onUnreadCount);

    return () => {
      s.off("notification", onNotification);
      s.off("notifications:unreadCount", onUnreadCount);
    };
  }, [userId, queryClient]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
