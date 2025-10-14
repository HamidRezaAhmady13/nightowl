"use client";

import { useParams } from "next/navigation";
import { api } from "@/features/lib/api";
import { getUserHeaderProps } from "@/app/utils/profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/features/components/shared/Button";
import { User } from "@/features/types";
import { UserHeader } from "@/features/components/header";
import { useCurrentUser } from "@/features/hooks/useCurrentUser";
import Spinner from "@/features/components/shared/Spinner";
import PostsGrid from "@/features/components/posts/PostGrid";
import OverlayRoutes from "@/features/components/OverlayRoutes";

export default function UserProfilePage() {
  const { username } = useParams();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const { data: profileUser, isLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: () => api.get(`/users/${username}`).then((res) => res.data),
    enabled: !!username,
  });

  const isFollowing = Array.isArray(currentUser?.following)
    ? (currentUser.following as User[]).some(
        (u: User) => u.username === username
      )
    : false;

  const followMutation = useMutation({
    mutationFn: () => api.post(`/users/${username}/follow`),
    onMutate: () => {
      queryClient.setQueryData(["currentUser"], (prev: User) => ({
        ...prev,
        following: [...(prev.following ?? []), { username }],
      }));
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["user", username] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => api.delete(`/users/${username}/unfollow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["user", username] });
    },
  });

  if (isLoading) return <Spinner />;
  if (!profileUser) return <p>User not found.</p>;

  const headerProps = getUserHeaderProps(profileUser);

  return (
    <div className="max-w-3xl mx-auto px-md py-2xl space-y-xl">
      {currentUser &&
        profileUser &&
        currentUser.email !== profileUser.email && (
          <Button
            label={isFollowing ? "Unfollow" : "Follow"}
            onClick={() => {
              if (isFollowing) {
                unfollowMutation.mutate();
              } else {
                followMutation.mutate();
              }
            }}
          />
        )}
      <UserHeader {...headerProps} />
      <PostsGrid />
      <OverlayRoutes />
    </div>
  );
}
