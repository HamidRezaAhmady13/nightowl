import { api } from "@/features/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (theme: "light" | "dark") => {
      const res = await api.patch("/users/theme", { theme });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], (old: any) => ({
        ...old,
        settings: {
          ...old?.settings,
          theme: data.settings.theme,
        },
      }));
    },
  });
}
