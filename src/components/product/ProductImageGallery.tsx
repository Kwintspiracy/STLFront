'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { ProductImage } from "@/types/product";

export default function ProductImageGallery({
  images,
  name,
}: {
  images?: ProductImage[];
  name: string;
}) {
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);

  useEffect(() => {
    if (images && images.length > 0) {
      const sorted = [...images].sort((a, b) => a.rank - b.rank);
      setSelectedImage(sorted[0]);
    }
  }, [images]);

  if (!images || images.length === 0 || !selectedImage) {
    return (
      <div className="w-full aspect-square bg-zinc-800 flex items-center justify-center text-white text-center rounded-md">
        No image available.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Image principale */}
      <div className="w-full aspect-square">
        <Image
          src={selectedImage.url}
          alt={name}
          width={800}
          height={800}
          className="object-cover w-full h-full rounded-md"
        />
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {[...images]
            .sort((a, b) => a.rank - b.rank)
            .map((img) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 rounded-md overflow-hidden border ${
                  selectedImage.id === img.id ? "border-orange-500" : "border-zinc-700"
                }`}
              >
                <Image
                  src={img.url}
                  alt={`Thumbnail ${img.id}`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
