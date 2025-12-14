import { useMutation } from "@tanstack/react-query";
import api from "../lib/api";

export function useMarkManyRead() {
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await api.patch("/notifications/mark-many-read", { ids });
      return res.data;
    },
  });
}
