import { mockProducts } from "@/data/mock-products";
import ProductCard from "@/components/card/ProductCard";


interface SearchParams {
  searchParams: Promise<{
    tags?: string;
    terms?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchParams) {
  const params = await searchParams;
  const selectedTags = params.tags?.split(",").map((t) => t.toLowerCase()) || [];
  const searchTerms = params.terms?.split(",").map((t) => t.toLowerCase()) || [];

  const filteredProducts = mockProducts.filter((product) => {
    const productTags = product.tag.map((tag) => tag.name.toLowerCase());

    const hasAllTags = selectedTags.every((tag) => productTags.includes(tag));
    const hasAllTerms = searchTerms.every((term) =>
      product.name.toLowerCase().includes(term)
    );

    return hasAllTags && hasAllTerms;
  });

  return (
    <div className="w-full min-h-screen bg-[#0F1213] py-12 px-4">
      <div className="mx-auto">
        {filteredProducts.length > 0 ? (
          <div className="max-w-[1920px] mx-auto w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-20">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-12 text-lg">No results found.</p>
        )}
      </div>
    </div>
  );
}
