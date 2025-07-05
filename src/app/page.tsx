import { getAllCategories } from "@/lib/api/categories";
import { getAllProducts } from "@/lib/api/products";
import ProductList from "@/components/product/ProductsList";
import Link from "next/link";
import SearchWrapper from "@/components/search/SearchWrapper";
import { Tag } from "@/data/mock-tags";

export default async function Home() {
  const products = await getAllProducts();
  const categories = await getAllCategories();
  const handleSearch = (tags: Tag[], text: string) => {
    console.log("Tags:", tags);
    console.log("Free text:", text);
    // TODO: Lancer la recherche ici
  };
  
  return (
    <div className="mx-auto">
      <SearchWrapper />
      <div className="bg-primarybackground">
        {/* Browse section */}
        <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center pt-8 sm:pt-12 pb-6 px-4 sm:px-6 lg:px-0 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Browse latest additions
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mt-2">
              Discover new 3D models from talented creators
            </p>
          </div>

          
          
        </div>
      </div>

      {/* Liste des produits */}
      <ProductList products={products} />
    </div>
  );
}
