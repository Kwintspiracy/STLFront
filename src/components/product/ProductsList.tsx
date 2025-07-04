import { Product } from "@/types/product"; // ✅ met partout en minuscule
import ProductCard from "../card/ProductCard";

interface Props {
  products: Product[];
}

export default function ProductList({ products }: Props) {
  return (
    <div className="bg-primarybackground w-full">
      <div className="max-w-[1920px] mx-auto w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-6 pb-20 px-4 3xl:px-0">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
