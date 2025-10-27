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

export type PostMode = "feed" | "modal";

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

export const SQUARE_RATIO = "aspect-[1/1]"; // replace with your real classes
export const PORTRAIT_RATIO = "aspect-[3/4]";
export const LANDSCAPE_RATIO = "aspect-[16/9]";
