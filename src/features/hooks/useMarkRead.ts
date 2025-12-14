// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import api from "../lib/api";
// import { FeedPage } from "../types";
// import { Notification } from "../types/notification.types";

// // mark one notification as read
// export function useMarkRead() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id: string) => {
//       await api.patch(`/notifications/${id}/read`);
//     },
//     onMutate: async (id: string) => {
//       // optimistic update: mark read in cache
//       queryClient.setQueryData<FeedPage<Notification>>(
//         ["notifications"],
//         (prev) =>
//           prev
//             ? {
//                 ...prev,
//                 items: prev.items.map((n) =>
//                   n.id === id ? { ...n, readAt: new Date().toISOString() } : n
//                 ),
//               }
//             : prev
//       );
//     },
//   });
// }

// // mark all as read
// export function useMarkAllRead() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async () => {
//       await api.patch("/notifications/mark-all-read");
//     },
//     onMutate: async () => {
//       queryClient.setQueryData<FeedPage<Notification>>(
//         ["notifications"],
//         (prev) =>
//           prev
//             ? {
//                 ...prev,
//                 items: prev.items.map((n) => ({
//                   ...n,
//                   readAt: new Date().toISOString(),
//                 })),
//               }
//             : prev
//       );
//     },
//   });
// }
