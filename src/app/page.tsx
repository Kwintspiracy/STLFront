import { getAllProducts } from "@/lib/api/products";
import ProductList from "@/components/product/ProductsList";
import SearchWrapper from "@/components/search/SearchWrapper";
import Link from "next/link";
import { FaFire, FaStar, FaUsers, FaArrowRight, FaCrown, FaHeart, FaDownload } from "react-icons/fa";

export default async function Home() {
  const products = await getAllProducts();
  
  // Simulate different product categories for demo
  const featuredProducts = products.slice(0, 4);
  const trendingProducts = products.slice(4, 8);
  const newProducts = products.slice(8, 12);
  
  return (
    <div className="mx-auto">
      {/* Hero Section */}
      <SearchWrapper />
      
      {/* Stats Section */}
      <div className="bg-primarybackground border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10K+</div>
              <div className="text-sm text-gray-400">3D Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2K+</div>
              <div className="text-sm text-gray-400">Creators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50K+</div>
              <div className="text-sm text-gray-400">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4.9★</div>
              <div className="text-sm text-gray-400">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="bg-primarybackground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FaCrown className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-white">Featured Models</h2>
            </div>
            <Link 
              href="/featured" 
              className="flex items-center gap-2 text-primary hover:text-white transition-colors text-sm"
            >
              View All <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group relative">
                <div className="bg-cardbackground border border-gray-800 rounded-lg overflow-hidden hover:border-yellow-500/50 transition-colors">
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={product.images[0]?.url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                        FEATURED
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-white truncate">{product.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">by {product.creator.name}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-primary">${product.price}</span>
                      <Link 
                        href={`/product/${product.id}`}
                        className="bg-primary text-black px-3 py-1.5 rounded text-sm font-medium hover:bg-[#3f6061] hover:text-secondary transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-cardbackground border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Browse by Tags</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Fantasy", icon: "🧙‍♂️", count: "2.1K" },
              { name: "Sci-Fi", icon: "🚀", count: "1.8K" },
              { name: "Medieval", icon: "⚔️", count: "1.5K" },
              { name: "Modern", icon: "🏢", count: "900" },
              { name: "Vehicles", icon: "🚗", count: "750" },
              { name: "Animals", icon: "🦁", count: "650" }
            ].map((category) => (
              <Link 
                key={category.name}
                href={`/category/${category.name.toLowerCase()}`}
                className="bg-primarybackground border border-gray-800 rounded-lg p-4 text-center hover:border-primary transition-colors group"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="font-medium text-white group-hover:text-primary transition-colors">
                  {category.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">{category.count} models</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="bg-primarybackground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FaFire className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-white">Trending This Week</h2>
            </div>
            <Link 
              href="/trending" 
              className="flex items-center gap-2 text-primary hover:text-white transition-colors text-sm"
            >
              View All <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product, index) => (
              <div key={product.id} className="group relative">
                <div className="bg-cardbackground border border-gray-800 rounded-lg overflow-hidden hover:border-orange-500/50 transition-colors">
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={product.images[0]?.url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                        <FaDownload className="w-3 h-3 text-white" />
                        <span className="text-xs text-white">{Math.floor(Math.random() * 500) + 100}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-white truncate">{product.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">by {product.creator.name}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-primary">${product.price}</span>
                      <Link 
                        href={`/product/${product.id}`}
                        className="bg-primary text-black px-3 py-1.5 rounded text-sm font-medium hover:bg-[#3f6061] hover:text-secondary transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Creator Spotlight */}
      <div className="bg-cardbackground border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Creator Spotlight</h2>
            <p className="text-gray-400">Meet the talented artists behind amazing 3D models</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Alex Chen", models: 45, downloads: "12K", avatar: "AC" },
              { name: "Maya Studio", models: 32, downloads: "8.5K", avatar: "MS" },
              { name: "Tech Forge", models: 28, downloads: "6.2K", avatar: "TF" }
            ].map((creator) => (
              <div key={creator.name} className="bg-primarybackground border border-gray-800 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-4">
                  {creator.avatar}
                </div>
                <h3 className="font-semibold text-white mb-2">{creator.name}</h3>
                <div className="flex justify-center gap-6 text-sm text-gray-400">
                  <div>
                    <div className="font-medium text-white">{creator.models}</div>
                    <div>Models</div>
                  </div>
                  <div>
                    <div className="font-medium text-white">{creator.downloads}</div>
                    <div>Downloads</div>
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-black transition-colors text-sm">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commercial License Available */}
      <div className="bg-primarybackground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">$</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Commercial License Available</h2>
            </div>
            <Link 
              href="/commercial" 
              className="flex items-center gap-2 text-primary hover:text-white transition-colors text-sm"
            >
              View All <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(12, 16).map((product) => (
              <div key={product.id} className="group relative">
                <div className="bg-cardbackground border border-gray-800 rounded-lg overflow-hidden hover:border-green-500/50 transition-colors">
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={product.images[0]?.url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded">
                        COMMERCIAL
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                        <span className="text-xs text-white">License: $</span>
                        <span className="text-xs text-green-400 font-bold">{(parseFloat(product.price) * 2).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-white truncate">{product.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">by {product.creator.name}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-lg font-bold text-primary">${product.price}</span>
                        <span className="text-xs text-gray-500 block">Personal Use</span>
                      </div>
                      <Link 
                        href={`/product/${product.id}`}
                        className="bg-primary text-black px-3 py-1.5 rounded text-sm font-medium hover:bg-[#3f6061] hover:text-secondary transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Need Commercial Rights */}
          {/* <div className="mt-8 text-center">
            <div className="bg-cardbackground border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Need Commercial Rights?</h3>
              <p className="text-gray-400 text-sm mb-4">
                Use these models for your business, sell prints, or create derivative works with our commercial licenses.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sell Physical Prints</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Commercial Projects</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Derivative Works</span>
                </div>
              </div>
            </div>
          </div> */}

        </div>
      </div>

      {/* Latest Additions */}
      <div className="bg-primarybackground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Latest Additions</h2>
              <p className="text-gray-400 mt-1">Fresh models from our community</p>
            </div>
            <Link 
              href="/latest" 
              className="flex items-center gap-2 text-primary hover:text-white transition-colors text-sm"
            >
              View All <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          {/* Use existing ProductList component for latest products */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {newProducts.map((product) => (
              <div key={product.id} className="bg-cardbackground border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors group">
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={product.images[0]?.url} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <button className="p-1.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-red-500/50 transition-colors">
                      <FaHeart className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-white text-sm truncate">{product.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">by {product.creator.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-primary">${product.price}</span>
                    <Link 
                      href={`/product/${product.id}`}
                      className="bg-primary text-black px-2 py-1 rounded text-xs font-medium hover:bg-[#3f6061] hover:text-secondary transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-y border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Creating?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators and tabletop enthusiasts. Upload your models or discover your next favorite miniature.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/upload"
              className="px-8 py-3 bg-primary text-black rounded-lg font-semibold hover:bg-[#3f6061] hover:text-secondary transition-colors"
            >
              Start Selling
            </Link>
            <Link 
              href="/browse"
              className="px-8 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors"
            >
              Browse Models
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
