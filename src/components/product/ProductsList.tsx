import { Product } from "@/types/product"; // ✅ met partout en minuscule
import ProductCard from "../card/ProductCard";

interface Props {
  products: Product[];
}

export default function ProductList({ products }: Props) {
  return (
    <div className="bg-primarybackground w-full">
      <div className="max-w-[1920px] mx-auto w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-2 pb-20 px-4 sm:px-6 lg:px-0">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
