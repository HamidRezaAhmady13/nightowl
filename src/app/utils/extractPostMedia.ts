import { Post } from "@/features/types";

export function getVideoVariants(post: Post) {
  return (
    post.media?.filter(
      (m) => m.type === "video" && m.quality && m.quality !== "original"
    ) || []
  );
}

export function getOriginalVideo(post: Post) {
  return post.media?.find(
    (m) => m.type === "video" && m.quality === "original"
  );
}

export function getPosterImage(post: Post) {
  return post.media?.find(
    (m) =>
      m.type === "image" &&
      m.url.includes("thumbnail") &&
      m.url.endsWith(".jpg")
  );
}

export function getPostImages(post: Post) {
  return (
    post.media?.filter(
      (m) =>
        m.type === "image" &&
        !m.url.includes("thumbnail") &&
        !m.url.includes("sprite")
    ) || []
  );
}

export function extractThumbnailMeta(originalVideoUrl: string) {
  const parts = originalVideoUrl.split("/");

  const userId =
    parts.find((p) => p.startsWith("user-"))?.replace("user-", "") || "";
  const postId =
    parts.find((p) => p.startsWith("post-"))?.replace("post-", "") || "";
  const videoBaseName = parts.pop()?.split("-original-")[0] || "";

  return { userId, postId, videoBaseName };
}
