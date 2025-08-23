import { getProductById, getAllProducts, getProductsByStudio, getProductsByTags } from "@/lib/api/products";
import { hasCommercialLicense, getPersonalPrice } from "@/types/product";
import { notFound } from "next/navigation";
import { RiDownloadLine } from "react-icons/ri";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import StudioBlock from "@/components/studio/StudioBlock";
import ProductLicenseSelector from "@/app/product/[id]/ProductLicenseSelector";
import SectionSeparator from "@/components/ui/SectionSeparator";
import StudioProductsCarousel from "./StudioProductsCarousel";
import SimilarProductsCarousel from "./SimilarProductsCarousel";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Static generation with shorter revalidation for product details
export const revalidate = 1800; // 30 minutes

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  try {
    const product = await getProductById(Number(id));
    
    if (!product) {
      notFound();
    }

    const hasCommercialLicenseAvailable = hasCommercialLicense(product);
    const personalPrice = getPersonalPrice(product);
    const isFreeProduct = parseFloat(personalPrice) === 0;

    // Récupérer les produits du même studio (exclure le produit actuel)
    const studioProducts = product.creator ? 
      (await getProductsByStudio(product.creator.id)).filter(p => p.id !== product.id).slice(0, 8) : 
      [];

    // Récupérer les produits avec des tags similaires
    const similarProducts = product.tag && product.tag.length > 0 ? 
      await getProductsByTags(product.tag, product.id) : 
      [];

    return (
      <div className="mx-auto">
        {/* Main Content Section */}
        <div className="bg-transparent">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
            {/* Product Header - Above everything */}
            <div className="space-y-3 mb-8">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight text-white">
                {product.name}
              </h1>

              {/* Studio Block */}
              {product.creator && (
                <StudioBlock studio={product.creator} />
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Product Image Gallery */}
              <div className="space-y-6">
                <ProductImageGallery images={product.images} name={product.name} />
              </div>

              {/* Product Information */}
              <div className="space-y-8">
                
                {/* License Selection Component */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-extrabold">
                    <span className="text-primary">LICENSE</span>
                    <span className="text-white"> OPTIONS</span>
                  </h2>
                  <ProductLicenseSelector 
                    product={product}
                    hasCommercialLicense={hasCommercialLicenseAvailable}
                    isFreeProduct={isFreeProduct}
                  />
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-700"></div>

                {/* Files Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-extrabold flex items-center gap-3">
                    <RiDownloadLine className="w-6 h-6 text-primary" />
                    <span className="text-primary">INCLUDED</span>
                    <span className="text-white"> FILES</span>
                  </h2>

                  <div className="space-y-3">
                    {Array.isArray(product.stl_files) && product.stl_files.length > 0 ? (
                      product.stl_files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-4 p-4 rounded-xl border border-gray-700"
                          style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                        >
                          <RiDownloadLine className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-white font-medium">
                            {file.title}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div 
                        className="text-gray-400 italic p-4 rounded-xl border border-gray-700"
                        style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                      >
                        No downloadable files available.
                      </div>
                    )}
                  </div>
                </div>

                {/* Description Section - Only show if description exists */}
                {product.description && product.description.trim() && (
                  <>
                    {/* Divider */}
                    <div className="h-px bg-gray-700"></div>

                    <div className="space-y-6">
                      <h2 className="text-2xl font-extrabold">
                        <span className="text-primary">PRODUCT</span>
                        <span className="text-white"> DESCRIPTION</span>
                      </h2>
                      <p className="text-gray-300 leading-relaxed text-base">
                        {product.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* More from this Studio Section */}
        {studioProducts.length > 0 && product.creator && (
          <>
            <SectionSeparator />
            <StudioProductsCarousel 
              products={studioProducts}
              studioName={product.creator.name}
              studioId={product.creator.id}
            />
          </>
        )}

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <>
            <SectionSeparator />
            <SimilarProductsCarousel products={similarProducts} />
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    notFound();
  }
}

// Generate static params for popular products
export async function generateStaticParams() {
  try {
    // Get all products and pre-generate the most popular ones
    const products = await getAllProducts();
    // For now, generate static params for all published products
    // In production, you might want to limit this to popular products only
    return products
      .filter(p => p.status === 'published')
      .slice(0, 100) // Limit to first 100 products to avoid long build times
      .map((product) => ({
        id: product.id.toString(),
      }));
  } catch (error) {
    console.error('Error generating static params for products:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  
  try {
    const product = await getProductById(Number(id));
    
    if (!product) {
      return {
        title: 'Product Not Found - STL Forge',
      };
    }

    return {
      title: `${product.name} - STL Forge`,
      description: product.description || `Download ${product.name} 3D model from STL Forge. Created by ${product.creator?.name || 'Unknown Creator'}.`,
      openGraph: {
        title: product.name,
        description: product.description || `3D model by ${product.creator?.name || 'Unknown Creator'}`,
        images: product.images && product.images.length > 0 ? [
          {
            url: product.images[0].image,
            width: 800,
            height: 600,
            alt: product.name,
          }
        ] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product - STL Forge',
    };
  }
}
