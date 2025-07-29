import { getProductById, getAllProducts } from "@/lib/api/products";
import { notFound } from "next/navigation";
import { RiDownloadLine } from "react-icons/ri";
import TagPill from "@/components/card/TagPill";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import StudioBlock from "@/components/studio/StudioBlock";
import ProductLicenseSelector from "@/app/product/[id]/ProductLicenseSelector";

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

    const hasCommercialLicense = product.professional_license_fee !== null && 
                                 product.professional_license_fee !== undefined &&
                                 parseFloat(product.professional_license_fee) > 0;

    const isFreeProduct = parseFloat(product.price) === 0;

    return (
      <main className="max-w-[1440px] mx-auto text-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center gap-2 sm:gap-4 py-4 sm:py-6" aria-label="Breadcrumb">
          {product.tag && product.tag.map((tag: { id: number; name: string }) => (
            <TagPill key={tag.id} tag={tag.name} />
          ))}
        </nav>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

          {/* Product Image Gallery */}
          <div className="lg:col-span-3">
            <ProductImageGallery images={product.images} name={product.name} />
          </div>

          {/* Product Information */}
          <div className="lg:col-span-2 space-y-6">

            {/* Product Header */}
            <div className="space-y-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight text-white">
                {product.name}
              </h1>

              {/* Studio Block */}
              {product.creator && (
                <StudioBlock studio={product.creator} />
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-700"></div>

            {/* License Selection Component - Client-side for interactivity */}
            <ProductLicenseSelector 
              product={product}
              hasCommercialLicense={hasCommercialLicense}
              isFreeProduct={isFreeProduct}
            />

            {/* Divider */}
            <div className="h-px bg-gray-700"></div>

            {/* Files Section */}
            <div className="space-y-4">
              <h2 className="text-white text-lg sm:text-xl font-bold flex items-center gap-2">
                <RiDownloadLine className="w-5 h-5 text-primary" />
                Included Files
              </h2>

              <div className="space-y-2">
                {Array.isArray(product.stl_files) && product.stl_files.length > 0 ? (
                  product.stl_files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700"
                    >
                      <RiDownloadLine className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-200 text-sm font-medium truncate">
                        {file.title}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm italic p-3 bg-gray-800/30 rounded-lg">
                    No downloadable files available.
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-white text-lg sm:text-xl font-bold">
                Description
              </h2>
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  {product.description || "No description available for this product."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
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
