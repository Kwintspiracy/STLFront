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
    <div className="relative group w-full max-w-xl transition-transform duration-300 ease-in-out hover:-translate-y-1">
      {/* Border gradient wrapper */}
      <div className="absolute -inset-0.5 rounded-md bg-gradient-to-b from-primarybackground via-primary to-primarybackground opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 pointer-events-none" />

      {/* Main card content */}
      <div className="relative z-10 bg-cardbackground overflow-hidden flex flex-col rounded-md pb-2 border border-gray-800">
        <Link href={`/product/${product.id}`}>
          <div className="relative w-full aspect-square overflow-hidden">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-secondarybackground text-white flex items-center justify-center">
                No image
              </div>
            )}
          </div>
        </Link>

        <div className="px-4 pt-2 pb-4 space-y-2">
          <Link href={`/product/${product.id}`}>
            <div className="flex justify-between items-start">
              <h3 className="text-base sm:text-lg font-semibold tracking-tight line-clamp-1 pb-1 pt-1">
                {product.name}
              </h3>
            </div>
          </Link>

          <div className="flex items-center gap-3 pb-3 text-sm sm:text-base text-stone-400">
            {product.creator.creatorlogo && (
              <img
                src={product.creator.creatorlogo}
                alt={product.creator.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
            <span>{product.creator.name}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xl sm:text-xl font-bold tracking-tight text-primary">
              ${product.price}
            </span>
            <div className="flex gap-1.5">
              {/* <CardFavButton>
                <RiPokerHeartsLine className="w-4 h-4 sm:w-6 sm:h-6" />
              </CardFavButton> */}
              <CardCartButton href="/fantasy">
                <RiShoppingCart2Fill className="w-4 h-4 sm:w-6 sm:h-6" />
              </CardCartButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );



}
