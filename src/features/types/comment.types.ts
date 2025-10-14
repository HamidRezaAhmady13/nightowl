import type { User } from "./user.types";

type CommentBase = {
  id: string;
  text: string;
  author: User;
  postId: string; // Changed from Pick<Post, "id">, assuming it's just the ID
  createdAt: string;
  likeCount: number;
  replyCount: number;
};

export type Comment = CommentBase & {
  parentCommentId: string | null;
  childComments: Comment[];
  likedByUsers?: User[];
};

export type CommentWithLikeState = CommentBase & {
  parentCommentId: string | null;
  childComments: CommentWithLikeState[]; // recursive
  likedByCurrentUser: boolean;
};

export type CommentFormProps = {
  postId: string;
  parentCommentId?: string | null;
  className?: string;
  initialText?: string;
  onSuccess?: () => void;
  onPointerDown?: () => void;
  autoFocus?: boolean;
};

export type AddCommentVars = {
  text: string;
  parentCommentId?: string | null;
  postId: string | null;
};

// Option 1: Separate data and UI props
export type CommentItemData = CommentWithLikeState;

export type CommentItemUIProps = {
  isReply?: boolean;
  onReply: (id: string, username: string, text: string) => void;
  parentIdForQuery?: string;
  postId: string; // Add postId here if needed in the UI component
};

export type CommentItemProps = CommentItemData & CommentItemUIProps;

export type ToggleLikeVars = {
  commentId: string;
  liked: boolean;
  parentCommentId?: string | null;
};
