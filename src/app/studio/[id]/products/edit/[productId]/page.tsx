"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useStudio } from "@/context/StudioContext";
import { useToast } from "@/context/ToastContext";
import { getProductById, updateProduct } from "@/lib/api/products";
import { getAllCategories } from "@/lib/api/categories";
import { allTags } from "@/data/mock-tags";
import { Category, Tag, Product } from "@/types/product";
import FileUploadZone from "@/components/studio/FileUploadZone";
import { RiArrowLeftLine, RiArrowDownSLine, RiArrowUpSLine, RiSaveLine } from "react-icons/ri";

interface Props {
  params: Promise<{ id: string; productId: string }>;
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  progress: number;
  url?: string;
  isUploading: boolean;
  error?: string;
  isMain?: boolean;
}

export default function EditProductPage({ params }: Props) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { myStudio, myStudioLoading } = useStudio();
  const { showError, showSuccess } = useToast();
  
  const [studioId, setStudioId] = useState<number | null>(null);
  const [productId, setProductId] = useState<number | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags] = useState<Tag[]>(
    allTags.map(tag => ({
      ...tag,
      slug: tag.name.toLowerCase().replace(/\s+/g, '-')
    }))
  );
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "0.99",
    professional_license_fee: "0.00",
    category: "",
    print_settings: "",
    dimensions: "",
    isPublic: true,
    isFree: false,
    status: "draft" as "draft" | "published" | "withdrawn",
  });

  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  // File upload state
  const [uploadedImages, setUploadedImages] = useState<UploadedFile[]>([]);
  const [uploadedSTLFiles, setUploadedSTLFiles] = useState<UploadedFile[]>([]);

  // Resolve params
  useEffect(() => {
    params.then(resolvedParams => {
      const sId = parseInt(resolvedParams.id, 10);
      const pId = parseInt(resolvedParams.productId, 10);
      setStudioId(sId);
      setProductId(pId);
    });
  }, [params]);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      showError("Vous devez être connecté pour modifier un produit");
      router.push("/auth/signin");
      return;
    }
  }, [isAuthenticated, router, showError]);

  useEffect(() => {
    // Check studio membership and match with URL
    if (!myStudioLoading && studioId) {
      if (!myStudio || myStudio.studio.id !== studioId) {
        showError("Vous n'avez pas accès à ce studio");
        router.push("/");
        return;
      }
    }
  }, [myStudio, myStudioLoading, studioId, router, showError]);

  useEffect(() => {
    // Load categories
    loadCategories();
  }, []);

  useEffect(() => {
    // Load product data
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadCategories = async () => {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  const loadProduct = async () => {
    if (!productId) return;
    
    try {
      setLoadingProduct(true);
      const productData = await getProductById(productId);
      
      if (!productData) {
        showError("Produit introuvable");
        router.push(`/studio/${studioId}/products`);
        return;
      }

      // Check if product belongs to this studio
      const productStudioId = typeof productData.studio === 'number' 
        ? productData.studio 
        : productData.studio.id;
        
      if (productStudioId !== studioId) {
        showError("Vous n'avez pas accès à ce produit");
        router.push(`/studio/${studioId}/products`);
        return;
      }

      setProduct(productData);
      
      // Populate form with product data
      setFormData({
        name: productData.name,
        description: productData.description || "",
        price: productData.price,
        professional_license_fee: productData.professional_license_fee,
        category: productData.category?.id?.toString() || "",
        print_settings: productData.print_settings || "",
        dimensions: productData.dimensions || "",
        isPublic: productData.status === "published",
        isFree: parseFloat(productData.price) === 0,
        status: productData.status === "withdrawn" ? "draft" : productData.status,
      });

      // Set selected tags
      setSelectedTags(productData.tags.map(tag => tag.id));

      // Convert existing images to UploadedFile format
      const existingImages = productData.images.map((img, index) => ({
        id: `existing-img-${img.id}`,
        file: new File([], img.title || `Image ${index + 1}`),
        name: img.title || `Image ${index + 1}`,
        progress: 100,
        url: img.image,
        isUploading: false,
        isMain: img.rank === 1,
      }));
      setUploadedImages(existingImages);

      // Convert existing STL files to UploadedFile format
      const existingSTLs = productData.stl_files.map((stl) => ({
        id: `existing-stl-${stl.id}`,
        file: new File([], stl.title),
        name: stl.title,
        progress: 100,
        url: stl.file,
        isUploading: false,
      }));
      setUploadedSTLFiles(existingSTLs);

    } catch (error) {
      console.error("Erreur lors du chargement du produit:", error);
      showError("Erreur lors du chargement du produit");
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      
      // Si gratuit, mettre les prix à 0
      if (name === 'isFree' && checked) {
        setFormData(prev => ({
          ...prev,
          price: "0.00",
          professional_license_fee: "0.00"
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // File upload handlers
  const handleImagesAdded = (files: File[]) => {
    const newImages = files.map(file => ({
      id: `img-${Date.now()}-${Math.random()}`,
      file,
      name: file.name.replace(/\.[^/.]+$/, ""),
      progress: 0,
      isUploading: true,
      isMain: uploadedImages.length === 0 && files[0] === file,
    }));

    setUploadedImages(prev => [...prev, ...newImages]);

    // Simulate upload for each file
    newImages.forEach(img => {
      simulateUpload(img.id, 'image');
    });
  };

  const handleSTLFilesAdded = (files: File[]) => {
    const newFiles = files.map(file => ({
      id: `stl-${Date.now()}-${Math.random()}`,
      file,
      name: file.name.replace(/\.[^/.]+$/, ""),
      progress: 0,
      isUploading: true,
    }));

    setUploadedSTLFiles(prev => [...prev, ...newFiles]);

    // Simulate upload for each file
    newFiles.forEach(file => {
      simulateUpload(file.id, 'stl');
    });
  };

  const simulateUpload = (fileId: string, type: 'image' | 'stl') => {
    const interval = setInterval(() => {
      if (type === 'image') {
        setUploadedImages(prev => prev.map(img => {
          if (img.id === fileId) {
            if (img.progress >= 100) {
              clearInterval(interval);
              // Create preview URL
              const url = URL.createObjectURL(img.file);
              return { ...img, progress: 100, isUploading: false, url };
            }
            return { ...img, progress: Math.min(img.progress + 10, 100) };
          }
          return img;
        }));
      } else {
        setUploadedSTLFiles(prev => prev.map(file => {
          if (file.id === fileId) {
            if (file.progress >= 100) {
              clearInterval(interval);
              return { ...file, progress: 100, isUploading: false };
            }
            return { ...file, progress: Math.min(file.progress + 10, 100) };
          }
          return file;
        }));
      }
    }, 200);
  };

  const handleImageRemove = (id: string) => {
    setUploadedImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // If removed image was main, set first image as main
      if (filtered.length > 0 && prev.find(img => img.id === id)?.isMain) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const handleSTLRemove = (id: string) => {
    setUploadedSTLFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleImageReorder = (files: UploadedFile[]) => {
    setUploadedImages(files);
  };

  const handleSTLReorder = (files: UploadedFile[]) => {
    setUploadedSTLFiles(files);
  };

  const handleMainImageSelect = (id: string) => {
    setUploadedImages(prev => prev.map(img => ({
      ...img,
      isMain: img.id === id
    })));
  };

  const handleImageRename = (id: string, newName: string) => {
    setUploadedImages(prev => prev.map(img => 
      img.id === id ? { ...img, name: newName } : img
    ));
  };

  const handleSTLRename = (id: string, newName: string) => {
    setUploadedSTLFiles(prev => prev.map(file => 
      file.id === id ? { ...file, name: newName } : file
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId) return;

    // Validation
    if (!formData.name.trim()) {
      showError("Le nom du produit est obligatoire");
      return;
    }

    if (!formData.isFree && parseFloat(formData.price) <= 0) {
      showError("Le prix doit être supérieur à 0 pour un produit payant");
      return;
    }

    if (uploadedImages.length === 0) {
      showError("Veuillez ajouter au moins une image");
      return;
    }

    if (uploadedSTLFiles.length === 0) {
      showError("Veuillez ajouter au moins un fichier STL");
      return;
    }

    // Check if all files are uploaded
    const uploadingImages = uploadedImages.some(img => img.isUploading);
    const uploadingSTLs = uploadedSTLFiles.some(file => file.isUploading);
    
    if (uploadingImages || uploadingSTLs) {
      showError("Veuillez attendre la fin du téléchargement des fichiers");
      return;
    }

    setLoading(true);
    
    try {
      // Prepare product data
      const productData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.isFree ? "0.00" : formData.price,
        professional_license_fee: formData.isFree ? "0.00" : formData.professional_license_fee,
        print_settings: formData.print_settings.trim(),
        dimensions: formData.dimensions.trim(),
        status: formData.status,
      };

      // Add category if selected
      if (formData.category) {
        productData.category = parseInt(formData.category);
      }

      // Note: In a real implementation, you would handle file uploads here
      // and include their IDs in the product update

      const updatedProduct = await updateProduct(productId, productData);
      
      showSuccess("Produit mis à jour avec succès!");
      
      // Redirect to the studio products page
      router.push(`/studio/${studioId}/products`);
      
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          error.message || 
                          "Erreur lors de la mise à jour du produit";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking studio or loading product
  if (myStudioLoading || !studioId || loadingProduct) {
    return (
      <div className="min-h-screen bg-[#131618] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDD811] mx-auto"></div>
          <p className="mt-4 text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Don't render form if no studio access
  if (!myStudio || myStudio.studio.id !== studioId || !product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#131618]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href={`/studio/${studioId}/products`}
              className="p-2 hover:bg-[#1A1C21] rounded-lg transition-colors"
            >
              <RiArrowLeftLine className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Modifier le produit</h1>
              <p className="text-gray-400 mt-1">Modifiez les informations de votre produit</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Informations de base</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  maxLength={128}
                  required
                  className="w-full bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#FDD811] transition-colors"
                  placeholder="Ex: Vase décoratif 3D"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#FDD811] transition-colors resize-none"
                  placeholder="Décrivez votre produit..."
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#FDD811] transition-colors"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="withdrawn">Retiré</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Images du produit *</h2>
            
            <FileUploadZone
              accept="image/*"
              multiple={true}
              maxFiles={10}
              onFilesAdded={handleImagesAdded}
              uploadedFiles={uploadedImages}
              onFileRemove={handleImageRemove}
              onFileReorder={handleImageReorder}
              onMainImageSelect={handleMainImageSelect}
              onFileRename={handleImageRename}
              label="Télécharger des images"
              fileType="image"
            />
          </div>

          {/* STL Files */}
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Fichiers STL *</h2>
            
            <FileUploadZone
              accept=".stl"
              multiple={true}
              onFilesAdded={handleSTLFilesAdded}
              uploadedFiles={uploadedSTLFiles}
              onFileRemove={handleSTLRemove}
              onFileReorder={handleSTLReorder}
              onFileRename={handleSTLRename}
              label="Télécharger des fichiers STL"
              fileType="stl"
            />
          </div>

          {/* Pricing */}
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Tarification</h2>
            
            <div className="space-y-6">
              {/* Free toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isFree"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#FDD811] bg-[#131618] border-[#2A2D30] rounded focus:ring-[#FDD811] focus:ring-2"
                />
                <label htmlFor="isFree" className="text-sm font-medium text-gray-300">
                  Produit gratuit
                </label>
              </div>

              {!formData.isFree && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                      Prix (€)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0.01"
                      step="0.01"
                      required={!formData.isFree}
                      disabled={formData.isFree}
                      className="w-full bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#FDD811] transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="professional_license_fee" className="block text-sm font-medium text-gray-300 mb-2">
                      Frais de licence professionnelle (€)
                    </label>
                    <input
                      type="number"
                      id="professional_license_fee"
                      name="professional_license_fee"
                      value={formData.professional_license_fee}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      disabled={formData.isFree}
                      className="w-full bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#FDD811] transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Technical Details (Collapsible) */}
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full p-6 flex items-center justify-between text-left"
            >
              <h2 className="text-xl font-semibold text-white">Détails techniques</h2>
              {showTechnicalDetails ? (
                <RiArrowUpSLine className="w-5 h-5 text-gray-400" />
              ) : (
                <RiArrowDownSLine className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showTechnicalDetails && (
              <div className="px-6 pb-6 space-y-6">
                <div>
                  <label htmlFor="print_settings" className="block text-sm font-medium text-gray-300 mb-2">
                    Paramètres d'impression
                  </label>
                  <textarea
                    id="print_settings"
                    name="print_settings"
                    value={formData.print_settings}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#FDD811] transition-colors resize-none"
                    placeholder="Ex: Hauteur de couche: 0.2mm, Remplissage: 20%"
                  />
                </div>

                <div>
                  <label htmlFor="dimensions" className="block text-sm font-medium text-gray-300 mb-2">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleInputChange}
                    className="w-full bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#FDD811] transition-colors"
                    placeholder="Ex: Hauteur: 200mm, Diamètre: 100mm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Categorization */}
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Catégorisation</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                  Catégorie
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#FDD811] transition-colors"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedTags.includes(tag.id)
                          ? 'bg-[#FDD811] text-black'
                          : 'bg-[#131618] text-gray-300 border border-[#2A2D30] hover:border-[#FDD811]/50'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href={`/studio/${studioId}/products`}
              className="px-6 py-3 border border-[#2A2D30] text-gray-300 rounded-lg font-medium hover:bg-[#1A1C21] transition-colors"
            >
              Annuler
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#FDD811] text-black rounded-lg font-medium hover:bg-[#FDD811]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Mise à jour en cours...</span>
                </>
              ) : (
                <>
                  <RiSaveLine className="w-5 h-5" />
                  <span>Mettre à jour le produit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
