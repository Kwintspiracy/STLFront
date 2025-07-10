import { getAllProducts, getFeaturedProducts, getTrendingProducts, getCommercialProducts, getLatestProducts } from "@/lib/api/products";
import SearchWrapper from "@/components/search/SearchWrapper";
import ProductSection from "@/components/sections/ProductSection";
import CategoryGrid from "@/components/sections/CategoryGrid";
import CreatorSpotlight from "@/components/sections/CreatorSpotlight";
import CallToAction from "@/components/sections/CallToAction";
import LatestSection from "@/components/sections/LatestSection";
import { FaCrown, FaFire } from "react-icons/fa";

export default async function Home() {
  // Use proper filtering functions instead of just slicing
  const featuredProducts = await getFeaturedProducts();
  const trendingProducts = await getTrendingProducts();
  const commercialProducts = await getCommercialProducts();
  const newProducts = await getLatestProducts();
  
  return (
    <div className="mx-auto">
      {/* Hero Section */}
      <SearchWrapper />

      {/* Featured Section */}
      <ProductSection
        title="Featured Models"
        icon={<FaCrown className="w-6 h-6" />}
        products={featuredProducts}
        variant="featured"
        viewAllHref="/featured"
      />

      {/* Categories Section */}
      <CategoryGrid />

      {/* Trending Section */}
      <ProductSection
        title="Trending This Week"
        icon={<FaFire className="w-6 h-6" />}
        products={trendingProducts}
        variant="trending"
        viewAllHref="/trending"
        showRanking={true}
        showDownloads={true}
      />

      {/* Creator Spotlight */}
      <CreatorSpotlight />

      {/* Commercial License Available */}
      <ProductSection
        title="Commercial License Available"
        icon={
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-black text-xs font-bold">$</span>
          </div>
        }
        products={commercialProducts}
        variant="commercial"
        viewAllHref="/commercial"
        showCommercialInfo={true}
      />

      {/* Latest Additions */}
      <LatestSection products={newProducts} />

      {/* Call to Action */}
      <CallToAction />
    </div>
  );
}
