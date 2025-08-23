'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStudio } from '@/context/StudioContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { notFound, useRouter } from 'next/navigation';
import { getProductsByStudio, deleteProduct } from '@/lib/api/products';
import type { Studio } from '@/types/studio';
import type { Product } from '@/types/product';
import { getPrimaryCategory } from '@/types/product';
import { RiEditLine, RiEyeLine, RiDeleteBinLine, RiBox3Line } from 'react-icons/ri';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Props {
  params: Promise<{ id: string }>;
}

export default function StudioProducts({ params }: Props) {
  const [studioId, setStudioId] = useState<number | null>(null);
  const [studio, setStudio] = useState<Studio | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { getStudio } = useStudio();
  const { isAuthenticated } = useAuth();
  const { showError, showSuccess } = useToast();
  const router = useRouter();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then(resolvedParams => {
      const id = parseInt(resolvedParams.id, 10);
      setStudioId(id);
    });
  }, [params]);

  // Load studio data
  useEffect(() => {
    if (!studioId) return;

    const loadStudio = async () => {
      try {
        setLoading(true);
        setError(null);
        const studioData = await getStudio(studioId);
        setStudio(studioData);
      } catch (err: unknown) {
        console.error('Error loading studio:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load studio';
        setError(errorMessage);
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          notFound();
        }
      } finally {
        setLoading(false);
      }
    };

    loadStudio();
  }, [studioId, getStudio]);

  // Load products
  useEffect(() => {
    if (!studioId || !studio) return;

    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        console.log('Loading products for studio:', studioId);
        const productsData = await getProductsByStudio(studioId);
        console.log('Products loaded:', productsData);
        console.log('Number of products:', productsData.length);
        
        // Check if products look like mock data
        if (productsData.length > 0) {
          const firstProduct = productsData[0];
          console.log('First product details:', {
            id: firstProduct.id,
            name: firstProduct.name,
            studio: firstProduct.studio,
            hasCreator: 'creator' in firstProduct,
            created_at: firstProduct.created_at,
          });
          
          if (firstProduct.images?.length > 0) {
            console.log('First product image:', firstProduct.images[0]);
          }
        }
        
        setProducts(productsData);
      } catch (err: unknown) {
        console.error('Error loading products:', err);
        // Don't show error for products, just show empty state
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, [studioId, studio]);

  // Filter products
  const filteredProducts = products.filter(product => {
    // Filter by status
    if (filter === 'published' && product.status !== 'published') return false;
    if (filter === 'draft' && product.status !== 'draft') return false;
    
    // Filter by search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Calculate stats
  const totalProducts = products.length;
  const publishedProducts = products.filter(p => p.status === 'published').length;
  const draftProducts = products.filter(p => p.status === 'draft').length;
  const totalDownloads = products.reduce((sum, p) => sum + (p.downloads || 0), 0);

  // Delete handlers
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete || !studioId) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      
      // Remove product from list
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      
      showSuccess(`Product "${productToDelete.name}" has been deleted successfully`);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error: unknown) {
      console.error('Error deleting product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error deleting product';
      showError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-primary text-lg">Loading studio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-400 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!studio) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">
              <span className="text-primary">STUDIO</span>
              <span className="text-white"> PRODUCTS</span>
            </h1>
            <p className="text-[#9ca3af]">Manage your products for <span className="text-primary font-medium">{studio.name}</span></p>
          </div>
          <Link
            href={`/studio/${studioId}/products/add`}
            className="inline-block px-6 py-3 bg-primary text-black rounded-lg font-medium hover:bg-primary-hover transition-colors"
          >
            Add New Product
          </Link>
        </div>

        {/* Products Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="rounded-xl p-6 hover:scale-105 transition-transform"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <h3 className="text-sm font-medium text-[#9ca3af] mb-2">Total Products</h3>
            <p className="text-2xl font-bold text-primary">{totalProducts}</p>
          </div>
          
          <div 
            className="rounded-xl p-6 hover:scale-105 transition-transform"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <h3 className="text-sm font-medium text-[#9ca3af] mb-2">Published</h3>
            <p className="text-2xl font-bold text-green-400">{publishedProducts}</p>
          </div>
          
          <div 
            className="rounded-xl p-6 hover:scale-105 transition-transform"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <h3 className="text-sm font-medium text-[#9ca3af] mb-2">Draft</h3>
            <p className="text-2xl font-bold text-yellow-400">{draftProducts}</p>
          </div>
          
          <div 
            className="rounded-xl p-6 hover:scale-105 transition-transform"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <h3 className="text-sm font-medium text-[#9ca3af] mb-2">Total Downloads</h3>
            <p className="text-2xl font-bold text-blue-400">{totalDownloads}</p>
          </div>
        </div>

        {/* Products List */}
        <div 
          className="rounded-xl p-6"
          style={{ background: 'rgba(255, 255, 255, 0.04)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#F4F4F4]">Your Products</h2>
            <div className="flex items-center space-x-4">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'published' | 'draft')}
                className="bg-white/5 text-[#F4F4F4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
              >
                <option value="all">All Products</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 text-[#F4F4F4] rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder-[#9ca3af]"
              />
            </div>
          </div>

          {/* Products List */}
          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#9ca3af] mb-4">
                {searchTerm || filter !== 'all' 
                  ? "No products found with these criteria"
                  : "You don't have any products yet"}
              </p>
              {!searchTerm && filter === 'all' && (
                <Link
                  href={`/studio/${studioId}/products/add`}
                  className="inline-block px-6 py-3 bg-primary text-black rounded-lg font-medium hover:bg-primary-hover transition-colors"
                >
                  Create your first product
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.images && product.images.length > 0 && (product.images[0].url || product.images[0].image) ? (
                        <Image 
                          src={product.images[0].url || product.images[0].image || ''} 
                          alt={product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', product.images[0].url || product.images[0].image);
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg></div>';
                            }
                          }}
                        />
                      ) : (
                        <RiBox3Line className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-[#F4F4F4] font-medium">{product.name}</h3>
                      <p className="text-[#9ca3af] text-sm">
                        {getPrimaryCategory(product)?.name || 'No category'} • 
                        Created on {new Date(product.created_at).toLocaleDateString('en-US')}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`text-xs ${
                          product.status === 'published' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {product.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-xs text-[#9ca3af]">{product.downloads || 0} downloads</span>
                        <span className="text-xs text-primary">
                          {parseFloat(product.price) === 0 ? 'Free' : `$${product.price}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link 
                      href={`/studio/${studioId}/products/edit/${product.id}`}
                      className="p-2 text-[#9ca3af] hover:text-[#F4F4F4] transition-colors"
                      title="Edit"
                    >
                      <RiEditLine className="w-4 h-4" />
                    </Link>
                    <Link 
                      href={`/product/${product.id}`}
                      className="p-2 text-[#9ca3af] hover:text-[#F4F4F4] transition-colors"
                      title="View"
                    >
                      <RiEyeLine className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteClick(product)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors" 
                      title="Delete"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete the product "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
