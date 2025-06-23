import { Product } from "@/types/product";
import { RiShoppingCart2Fill } from "react-icons/ri";
import { RiPokerHeartsLine } from "react-icons/ri";
import CardCartButton from './CardCartButton';
import CardFavButton from './CardFavButton';
import TagPill from './TagPill';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const sortedImages = [...product.images].sort((a, b) => a.rank - b.rank);
  const mainImage = sortedImages[0]?.url;

  return (
    <div className="bg-[#1A1C21] overflow-hidden w-full max-w-xl flex flex-col rounded-md">
      <Link href={`/product/${product.id}`}>
        <div className="relative w-full aspect-square overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 text-white flex items-center justify-center">
              No image
            </div>
          )}
        </div>
      </Link>

      <div className="px-4 pt-2 pb-4 space-y-2">
        <Link href={`/product/${product.id}`}>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold tracking-tight line-clamp-1 pb-3 pt-1">
              {product.name}
            </h3>
          </div>
        </Link>

        <div className="flex col-auto gap-2 pb-3">
          {product.tag.map((tag) => (
            <TagPill key={tag.id} tag={tag.name} />
          ))}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-2xl font-semibold tracking-tight text-[#FDD811]">
            ${product.price}
          </span>
          <div className="flex gap-1.5">
            <CardFavButton>
              <RiPokerHeartsLine className="w-6 h-6" />
            </CardFavButton>
            <CardCartButton href="/fantasy">
              <RiShoppingCart2Fill className="w-6 h-6" />
            </CardCartButton>
          </div>
        </div>
      </div>
    </div>
  );
}
