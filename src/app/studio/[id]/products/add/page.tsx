"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useStudio } from "@/context/StudioContext";
import { useToast } from "@/context/ToastContext";
import { createProduct, uploadProductImage, uploadProductSTL } from "@/lib/api/products";
import { getAllCategories } from "@/lib/api/categories";
import { allTags } from "@/data/mock-tags";
import { Category, Tag } from "@/types/product";
import FileUploadZone from "@/components/studio/FileUploadZone";
import { RiArrowLeftLine, RiArrowDownSLine, RiArrowUpSLine, RiEyeLine, RiSaveLine } from "react-icons/ri";

interface Props {
  params: Promise<{ id: string }>;
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

export default function AddProductPage({ params }: Props) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { myStudio, myStudioLoading } = useStudio();
  const { showError, showSuccess } = useToast();
  
  const [studioId, setStudioId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
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
  });

  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  // File upload state
  const [uploadedImages, setUploadedImages] = useState<UploadedFile[]>([]);
  const [uploadedSTLFiles, setUploadedSTLFiles] = useState<UploadedFile[]>([]);

  // Resolve params
  useEffect(() => {
    params.then(resolvedParams => {
      const id = parseInt(resolvedParams.id, 10);
      setStudioId(id);
    });
  }, [params]);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      showError("Vous devez être connecté pour ajouter un produit");
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

  const loadCategories = async () => {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
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
      isMain: uploadedImages.length === 0 && files[0] === file, // First image is main by default
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

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    
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
        status: isDraft ? "draft" : "published",
      };

      // Add category if selected
      if (formData.category) {
        productData.category = parseInt(formData.category);
      }

      // Create the product first
      const newProduct = await createProduct(productData);
      
      // TODO: Upload functionality is temporarily disabled due to API endpoint issues
      // The upload endpoints return 404 errors and need to be fixed on the backend
      
      console.warn('File upload is temporarily disabled. Files selected but not uploaded:', {
        images: uploadedImages.length,
        stlFiles: uploadedSTLFiles.length
      });
      
      showSuccess(
        isDraft 
          ? "Brouillon créé avec succès! (Note: L'upload de fichiers est temporairement désactivé)" 
          : "Produit publié avec succès! (Note: L'upload de fichiers est temporairement désactivé)"
      );
      
      // Redirect to the studio products page
      router.push(`/studio/${studioId}/products`);
      
    } catch (error: any) {
      console.error("Erreur lors de la création du produit:", error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          error.message || 
                          "Erreur lors de la création du produit";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking studio
  if (myStudioLoading || !studioId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Chargement...</p>
        </div>
      </div>
    );
  }

  // Don't render form if no studio access
  if (!myStudio || myStudio.studio.id !== studioId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href={`/studio/${studioId}/products`}
              className="p-2 hover:bg-background-hover rounded-lg transition-colors"
            >
              <RiArrowLeftLine className="w-5 h-5 text-text-secondary" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Ajouter un nouveau produit</h1>
              <p className="text-text-secondary mt-1">Créez un nouveau produit pour {myStudio.studio.name}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Informations de base</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
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
                  className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors"
                  placeholder="Ex: Vase décoratif 3D"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Décrivez votre produit..."
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Images du produit *</h2>
            
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
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Fichiers STL *</h2>
            
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
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Tarification</h2>
            
            <div className="space-y-6">
              {/* Free toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isFree"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent focus:ring-2"
                />
                <label htmlFor="isFree" className="text-sm font-medium text-text-secondary">
                  Produit gratuit
                </label>
              </div>

              {!formData.isFree && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-text-secondary mb-2">
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
                      className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="professional_license_fee" className="block text-sm font-medium text-text-secondary mb-2">
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
                      className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Technical Details (Collapsible) */}
          <div className="bg-background-secondary border border-border rounded-lg">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full p-6 flex items-center justify-between text-left"
            >
              <h2 className="text-xl font-semibold text-text-primary">Détails techniques</h2>
              {showTechnicalDetails ? (
                <RiArrowUpSLine className="w-5 h-5 text-text-secondary" />
              ) : (
                <RiArrowDownSLine className="w-5 h-5 text-text-secondary" />
              )}
            </button>
            
            {showTechnicalDetails && (
              <div className="px-6 pb-6 space-y-6">
                <div>
                  <label htmlFor="print_settings" className="block text-sm font-medium text-text-secondary mb-2">
                    Paramètres d'impression
                  </label>
                  <textarea
                    id="print_settings"
                    name="print_settings"
                    value={formData.print_settings}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors resize-none"
                    placeholder="Ex: Hauteur de couche: 0.2mm, Remplissage: 20%"
                  />
                </div>

                <div>
                  <label htmlFor="dimensions" className="block text-sm font-medium text-text-secondary mb-2">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors"
                    placeholder="Ex: Hauteur: 200mm, Diamètre: 100mm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Categorization */}
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Catégorisation</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-2">
                  Catégorie
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors"
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
                <label className="block text-sm font-medium text-text-secondary mb-3">
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
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-background text-text-secondary border border-border hover:border-accent/50'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Visibilité</h2>
            
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="isPublic"
                  value="true"
                  checked={formData.isPublic === true}
                  onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                  className="w-4 h-4 text-accent bg-background border-border focus:ring-accent"
                />
                <span className="text-sm font-medium text-text-secondary">Public</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="isPublic"
                  value="false"
                  checked={formData.isPublic === false}
                  onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                  className="w-4 h-4 text-accent bg-background border-border focus:ring-accent"
                />
                <span className="text-sm font-medium text-text-secondary">Privé</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href={`/studio/${studioId}/products`}
              className="px-6 py-3 border border-border text-text-secondary rounded-lg font-medium hover:bg-background-hover transition-colors"
            >
              Annuler
            </Link>
            
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="px-6 py-3 border border-border text-text-secondary rounded-lg font-medium hover:bg-background-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RiEyeLine className="w-5 h-5" />
              <span>Enregistrer comme brouillon</span>
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <RiSaveLine className="w-5 h-5" />
                  <span>Publier le produit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
