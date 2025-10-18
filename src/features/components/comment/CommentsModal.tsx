"use client";
import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import CommentForm from "./CommentForm"; // your existing component
import CommentItem from "./CommentItem";
import { useComments } from "@/features/hooks/useComments";
import { useModalStack } from "@/features/hooks/useModalStack";

export default function CommentsModal({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const { data: comments, isLoading } = useComments({ postId });

  const scrollToTop = () =>
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  const [replyTo, setReplyTo] = useState<{
    immediateId: string;
    username: string;
    parentIdToSend: string;
  } | null>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: true };
    });

  const listRef = useRef<HTMLUListElement | null>(null);

  useModalStack(() => onClose());

  if (typeof window === "undefined") return null;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => prev?.focus();
  }, []);

  useEffect(() => {
    console.log("replyTo updated", replyTo);
  }, [replyTo]);

  useEffect(() => {
    console.log("DEBUG_MODAL_REPLY_TO", replyTo);
  }, [replyTo]);

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[110] u-flex-center" // ensure higher z than parent modal
      aria-modal="true"
      role="presentation"
    >
      {/* Backdrop: captures pointerdown and closes the top modal */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onPointerDown={() => onClose()}
      />

      {/* Dialog: stops pointer events so they do not bubble to backdrop or lower modals */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Comments"
        className="relative z-10 u-bg-deep rounded-lg w-full h-full sm:w-[60vw] sm:h-auto sm:max-w-xl sm:max-h-[80vh] flex flex-col"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="p-md flex-1 overflow-y-auto">
          <div className="u-flex-between mb-md">
            <h2 className="u-text-lg u-text-secondary">Comments</h2>
            <button onClick={onClose} className="u-text-tertiary u-text-xl">
              ✕
            </button>
          </div>
          {isLoading ? (
            <p>Loading...</p>
          ) : comments?.length ? (
            <ul className="space-y-md">
              {comments.map((c) => (
                <li key={c.id}>
                  {/*  */}
                  <CommentItem
                    {...c}
                    postId={postId}
                    isExpanded={Boolean(expanded[c.id])}
                    onToggleReplies={() => toggleExpanded(c.id)}
                    // pass control data so nested CommentItem can forward expansion/props
                    expandedMap={expanded}
                    toggleExpanded={toggleExpanded}
                    // new: pass reply state handlers into children
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="u-text-tertiary">No comments yet</p>
          )}
        </div>

        <div className="border-t u-border p-md w-full">
          <CommentForm
            postId={postId}
            onSuccess={() => {
              /* optional */
            }}
            className="w-full"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
