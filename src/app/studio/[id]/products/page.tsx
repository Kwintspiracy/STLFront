'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStudio } from '@/context/StudioContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { notFound, useRouter } from 'next/navigation';
import { getProductsByStudio, deleteProduct } from '@/lib/api/products';
import type { Studio } from '@/types/studio';
import type { Product } from '@/types/product';
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
      } catch (err: any) {
        console.error('Error loading studio:', err);
        setError(err.message || 'Failed to load studio');
        if (err.message?.includes('404') || err.message?.includes('not found')) {
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
      } catch (err: any) {
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
      
      showSuccess(`Le produit "${productToDelete.name}" a été supprimé avec succès`);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      showError(error.message || 'Erreur lors de la suppression du produit');
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Products</h1>
            <p className="text-text-secondary">Manage your products for {studio.name}</p>
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
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Total Products</h3>
            <p className="text-2xl font-bold text-primary">{totalProducts}</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Published</h3>
            <p className="text-2xl font-bold text-primary">{publishedProducts}</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Draft</h3>
            <p className="text-2xl font-bold text-primary">{draftProducts}</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Total Downloads</h3>
            <p className="text-2xl font-bold text-primary">{totalDownloads}</p>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-background-secondary border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Your Products</h2>
            <div className="flex items-center space-x-4">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'published' | 'draft')}
                className="bg-background border border-border text-text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
                className="bg-background border border-border text-text-primary rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:border-primary"
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
              <p className="text-text-secondary mb-4">
                {searchTerm || filter !== 'all' 
                  ? "Aucun produit trouvé avec ces critères"
                  : "Vous n'avez pas encore de produits"}
              </p>
              {!searchTerm && filter === 'all' && (
                <Link
                  href={`/studio/${studioId}/products/add`}
                  className="inline-block px-6 py-3 bg-primary text-black rounded-lg font-medium hover:bg-primary-hover transition-colors"
                >
                  Créer votre premier produit
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:border-primary/20 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0].url || product.images[0].image} 
                          alt={product.name}
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
                      <h3 className="text-text-primary font-medium">{product.name}</h3>
                      <p className="text-text-secondary text-sm">
                        {product.category?.name || 'Sans catégorie'} • 
                        Créé le {new Date(product.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`text-xs ${
                          product.status === 'published' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {product.status === 'published' ? 'Publié' : 'Brouillon'}
                        </span>
                        <span className="text-xs text-text-secondary">{product.downloads || 0} téléchargements</span>
                        <span className="text-xs text-primary">
                          {parseFloat(product.price) === 0 ? 'Gratuit' : `${product.price}€`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link 
                      href={`/studio/${studioId}/products/edit/${product.id}`}
                      className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                      title="Modifier"
                    >
                      <RiEditLine className="w-4 h-4" />
                    </Link>
                    <Link 
                      href={`/product/${product.id}`}
                      className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                      title="Voir"
                    >
                      <RiEyeLine className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteClick(product)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors" 
                      title="Supprimer"
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
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer le produit "${productToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
