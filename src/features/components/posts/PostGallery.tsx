import { API_URL } from "@/features/lib/api";
import { PostGalleryMedia } from "@/features/types";

import Image from "next/image";

import { useState, useCallback } from "react";

type Props = {
  images: PostGalleryMedia[];
  mode?: string; //"feed" | "modal"; // feed: cropped, fixed aspect thumbnails; modal: contain full image
};

const LANDSCAPE_RATIO = "aspect-[4/3]"; // 4:3
const PORTRAIT_RATIO = "aspect-[3/4]"; // 3:4
const SQUARE_RATIO = "aspect-square";

export default function PostGallery({ images, mode }: Props) {
  const [dims, setDims] = useState<Record<string, { w: number; h: number }>>(
    {}
  );

  const onLoad =
    (id: string) =>
    ({
      naturalWidth,
      naturalHeight,
    }: {
      naturalWidth: number;
      naturalHeight: number;
    }) => {
      setDims((prev) => {
        if (prev[id]?.w === naturalWidth && prev[id]?.h === naturalHeight)
          return prev;
        return { ...prev, [id]: { w: naturalWidth, h: naturalHeight } };
      });
    };

  return (
    <div className="flex flex-col items-center gap-4">
      {images.map((img) => {
        const known =
          img.width && img.height
            ? { w: img.width, h: img.height }
            : dims[img.id];
        const isVertical = known ? known.h > known.w : undefined;
        const isSquare = known ? known.h === known.w : false;

        // Choose ratio box for feed (thumbnails) — modal ignores aspect-box and uses contain
        const ratioClass =
          mode === "feed"
            ? isSquare
              ? SQUARE_RATIO
              : isVertical
              ? PORTRAIT_RATIO
              : LANDSCAPE_RATIO
            : ""; // modal: no aspect box, show intrinsic image

        // Intrinsic sizes for Next/Image (keeps good quality) — tuned per orientation
        const intrinsic = isVertical
          ? { width: 800, height: 1066 } // portrait
          : isSquare
          ? { width: 900, height: 900 } // square
          : { width: 1200, height: 900 }; // landscape

        // max image height when in modal (fills available modal content)
        const modalMaxHeight = "calc(85vh - 160px)";

        return (
          <div key={img.id} className="w-full max-w-3xl mx-auto">
            <div
              className={`w-full flex items-center justify-center ${
                mode === "feed" ? "" : ""
              }`}
            >
              {mode === "feed" ? (
                // feed: fixed aspect box, image covers and crops to maintain grid
                <div
                  className={`relative w-full ${ratioClass} overflow-hidden rounded-2xl`}
                >
                  <Image
                    src={`${API_URL}${img.url}`}
                    alt={img.alt ?? img.id}
                    fill
                    sizes="(min-width:1200px) 1000px, (min-width:768px) 70vw, 90vw"
                    className="object-cover object-center"
                    onLoadingComplete={onLoad(img.id)}
                  />
                </div>
              ) : (
                // modal: show whole image, scale up to available space but do not crop
                <div
                  style={{
                    maxHeight: modalMaxHeight,
                    overflow: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Image
                    src={`${API_URL}${img.url}`}
                    alt={img.alt ?? img.id}
                    width={intrinsic.width}
                    height={intrinsic.height}
                    sizes="(min-width:1200px) 1000px, (min-width:768px) 70vw, 90vw"
                    className="rounded-2xl object-contain"
                    style={{ maxWidth: "100%", height: "auto", width: "auto" }}
                    onLoadingComplete={onLoad(img.id)}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
