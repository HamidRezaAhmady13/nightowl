import { Comment } from "./comment.types";
import type { Media } from "./media.types";
import type { User, UserPreview } from "./user.types";

export type Post = {
  id: string;
  content: string;
  createdAt: string;
  owner: User;
  media: Media[];
  likedBy?: UserPreview[];
  comments?: Comment[];
  likesCount: number;
  commentsCount: number;
};

export type PostActionsProps = {
  post: Post;
  currentUserId: string;
  onCommentClick: () => void;
};

export type SinglePostProps = {
  post: Post;
  currentUserId: string;
  isActive: boolean;
  onActivate: () => void;
};

export type PostPreview = Pick<
  Post,
  "id" | "createdAt" | "likesCount" | "commentsCount"
> & {
  imageUrl?: string | null;
};
