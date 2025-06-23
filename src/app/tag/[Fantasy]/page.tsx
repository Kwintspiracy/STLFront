import { getProductsByCategory } from "@/lib/api/products"; // à créer
import { notFound } from "next/navigation";
import ProductList from "@/components/product/ProductsList";

export default async function CategoryPage({ params }: { params: { categoryName: string } }) {
  const products = await getProductsByCategory(params.categoryName);

  if (!products || products.length === 0) {
    notFound();
  }

  return (
    <main className="max-w-[1920px] mx-auto px-4 py-12 text-white">
      <h1 className="text-4xl font-bold mb-6">Category: {params.categoryName}</h1>
      <ProductList products={products} />
    </main>
  );
}
