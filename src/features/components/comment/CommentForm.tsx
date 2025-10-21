import { useRef, useState } from "react";
import FormInput from "../forms/FormInput";
import { useAddComment } from "@/features/hooks/useAddComment";
import Button from "../shared/Button";
import {
  CommentFormProps,
  Post,
  Comment as ApiComment,
} from "@/features/types";
import { useQueryClient } from "@tanstack/react-query";

export default function CommentForm({
  postId,
  parentCommentId = null,
  initialText = "",
  onSuccess,
  className,
  autoFocus,
}: CommentFormProps) {
  const [commentText, setCommentText] = useState(initialText || "");
  const addCommentMutation = useAddComment();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const submittingRef = useRef(false);
  const queryClient = useQueryClient();

  const doSubmit = () => {
    if (submittingRef.current) return;
    if (!commentText.trim()) return;
    submittingRef.current = true;

    addCommentMutation.mutate(
      { text: commentText, parentCommentId, postId },
      {
        onSuccess: (createdComment) => {
          // 1) If top-level comment, prepend to top-level comments list
          queryClient.setQueryData<ApiComment[] | undefined>(
            ["comments", postId],
            (old) => {
              const next = old ? [...old] : [];
              if (next.some((c) => c.id === createdComment.id)) return next;
              if (!createdComment.parentCommentId)
                return [createdComment, ...next];
              return next;
            }
          );

          // 2) If reply, update the replies cache for the parent comment so they appear immediately
          if (createdComment.parentCommentId) {
            const parentId = createdComment.parentCommentId;
            queryClient.setQueryData<ApiComment[] | undefined>(
              ["comments", parentId],
              (old) => {
                const next = old ? [...old] : [];
                if (next.some((r) => r.id === createdComment.id)) return next;
                return [createdComment, ...next];
              }
            );

            // Also increment replyCount visually on the parent in the top-level list
            queryClient.setQueryData<ApiComment[] | undefined>(
              ["comments", postId],
              (old) => {
                if (!old) return old;
                return old.map((c) =>
                  c.id === parentId
                    ? { ...c, replyCount: (c.replyCount ?? 0) + 1 }
                    : c
                );
              }
            );
          }

          // 3) Update posts cache counts
          queryClient.setQueryData<Post[] | undefined>(["posts"], (old) =>
            old
              ? old.map((p) =>
                  p.id === postId
                    ? { ...p, commentsCount: (p.commentsCount ?? 0) + 1 }
                    : p
                )
              : old
          );
          queryClient.setQueryData<Post | undefined>(["post", postId], (old) =>
            old ? { ...old, commentsCount: (old.commentsCount ?? 0) + 1 } : old
          );

          // 4) Gentle revalidation to keep server truth
          queryClient.invalidateQueries({ queryKey: ["comments", postId] });
          if (createdComment.parentCommentId)
            queryClient.invalidateQueries({
              queryKey: ["comments", createdComment.parentCommentId],
            });
          queryClient.invalidateQueries({ queryKey: ["post", postId] });

          // 5) Reset and notify
          setCommentText("");
          submittingRef.current = false;
          onSuccess?.();
        },
        onError: () => {
          submittingRef.current = false;
        },
      }
    );
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    doSubmit();
  };

  const handleInputKeyDown: React.KeyboardEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        doSubmit();
      } else {
        e.stopPropagation();
      }
    } else if (e.key === "Escape") {
      e.stopPropagation();
      setCommentText("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`u-flex-center gap-sm w-full ${className || ""}`}
    >
      <div className="flex-1 h-2xl u-flex-center">
        <FormInput
          autoFocus={autoFocus}
          ref={inputRef}
          value={commentText}
          placeholder="Write a comment..."
          multiline
          rows={1}
          onChange={(e) => setCommentText(e.target.value)}
          wrapperClassName="flex-1 h-2xl u-flex-center"
          onKeyDown={handleInputKeyDown}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <Button
        type="submit"
        disabled={addCommentMutation.isPending}
        height={"md"}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {addCommentMutation.isPending ? "..." : "Post"}
      </Button>
    </form>
  );
}
