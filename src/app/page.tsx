import { getAllCategories } from "@/lib/api/categories";
import MainSearch from "@/components/layout/MainSearch";
import { getAllProducts } from "@/lib/api/products";
import ProductList from "@/components/product/ProductsList";
import Link from "next/link";
import SearchWrapper from "@/components/search/SearchWrapper";
import { Tag } from "@/data/mock-tags";

export default async function Home({ searchParams }: { searchParams: { category?: string } }) {
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
        {/* Liste des categories */}
        <div className="max-w-[1920px] mx-auto flex justify-between text items-center pt-12 pb-6 px-4 3xl:px-0">
          <span className="text-2xl sm:text-4xl font-bold text-white">Browse latest additions</span>

          {/* <div className="flex flex-wrap gap-3 py-4">
            {categories
            .filter((cat) => cat.id === 1 || cat.id === 6)
            .map((cat) => (
              <Link
                key={cat.id}
                href={`/tag/${cat.name}`}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-600"
              >
                {cat.name}
              </Link>
            ))}
          </div> */}
        </div>
      </div>

      {/* Liste des produits */}
      <ProductList products={products} />
    </div>
  );
}
