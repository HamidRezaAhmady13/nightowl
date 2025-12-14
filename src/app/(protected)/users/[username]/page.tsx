"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/features/components/shared/Button";
import { User, UserPreview } from "@/features/types"; // <-- ensure UserPreview exists
import { UserHeader } from "@/features/components/header";
// import { useCurrentUser } from "@/app/(protected)/hooks/useCurrentUser";
import Spinner from "@/features/components/shared/Spinner";
import PostsGrid from "@/features/components/posts/PostGrid";
import OverlayRoutes from "@/features/components/OverlayRoutes";
import { useCurrentUser } from "@/features/hooks/useCurrentUser";
import { getUserHeaderProps } from "@/features/utils/profile";
import api from "@/features/lib/api";

type UserPreviewNoId = Omit<UserPreview, "id">;
function decodeSafe(u?: string) {
  if (!u) return u;
  try {
    return decodeURIComponent(u).trim();
  } catch {
    return u.trim();
  }
}

export default function UserProfilePage() {
  const params = useParams();
  const rawUsername = params?.username;
  const username = Array.isArray(rawUsername)
    ? rawUsername[0]
    : rawUsername ?? undefined;

  const decodedUsername = decodeSafe(username);
  if (!decodedUsername) return <p>User not found.</p>;

  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  // Use decoded username as the cache key; encode only for network paths
  const { data: profileUser, isLoading } = useQuery({
    queryKey: ["user", decodedUsername],
    queryFn: async () => {
      const res = await api.get(
        `/users/${encodeURIComponent(decodedUsername)}`
      );

      console.log(res);
      return res.data;
    },

    enabled: !!decodedUsername,
  });

  // console.log(profileUser);

  // `following` is an array of previews; compare preview.username
  const isFollowing = Array.isArray(currentUser?.following)
    ? (currentUser.following as UserPreview[]).some(
        (u) => u.username === decodedUsername
      )
    : false;

  // client: ensure server returns { currentUser: User } after follow/unfollow
  const followMutation = useMutation({
    mutationFn: async ({ username }: { username: string }) => {
      const res = await api.post(
        `/users/${encodeURIComponent(username)}/follow`
      );

      return res;
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ["currentUser"] });
      const prev = queryClient.getQueryData<User | undefined>(["currentUser"]);
      // optimistic add
      queryClient.setQueryData<User | undefined>(["currentUser"], (old) =>
        old
          ? {
              ...old,
              following: [
                ...(old.following ?? []),
                { username: vars.username, id: `temp-${Date.now()}` },
              ],
            }
          : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev) queryClient.setQueryData(["currentUser"], ctx.prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", decodedUsername] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async ({ username }: { username: string }) => {
      const res = await api.delete(
        `/users/${encodeURIComponent(username)}/unfollow`
      );

      return res;
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ["currentUser"] });
      const prev = queryClient.getQueryData<User | undefined>(["currentUser"]);
      // optimistic remove
      queryClient.setQueryData<User | undefined>(["currentUser"], (old) =>
        old
          ? {
              ...old,
              following: (old.following ?? []).filter(
                (u: UserPreview) => u.username !== vars.username
              ),
            }
          : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev) queryClient.setQueryData(["currentUser"], ctx.prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", decodedUsername] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  // Button: disable while either mutation is running to prevent double clicks
  <Button
    label={isFollowing ? "Unfollow" : "Follow"}
    disabled={followMutation.isPending || unfollowMutation.isPending}
    onClick={() => {
      if (!decodedUsername) return;
      if (isFollowing) unfollowMutation.mutate({ username: decodedUsername });
      else followMutation.mutate({ username: decodedUsername });
    }}
  />;

  if (isLoading) return <Spinner />;
  if (!profileUser) return <p>User not found.</p>;

  const headerProps = getUserHeaderProps(profileUser);
  console.log(headerProps);

  return (
    <div className="max-w-3xl mx-auto px-md py-2xl space-y-xl">
      {currentUser &&
        profileUser &&
        currentUser.email !== profileUser.email && (
          <Button
            label={isFollowing ? "Unfollow" : "Follow"}
            onClick={() => {
              if (!decodedUsername) return;
              if (isFollowing) {
                unfollowMutation.mutate({ username: decodedUsername });
              } else {
                followMutation.mutate({ username: decodedUsername });
              }
            }}
          />
        )}

      <UserHeader {...headerProps} />
      <PostsGrid username={decodedUsername} />
      <OverlayRoutes />
    </div>
  );
}
