'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useStudio } from "@/context/StudioContext";
import { useToast } from "@/context/ToastContext";
import { 
  getProductByIdAuthenticated, 
  updateProduct, 
  uploadProductImage, 
  deleteProductImage, 
  deleteProductSTL,
  setMainProductImage,
  updateImageOrder
} from "@/lib/api/products";
import { uploadMultipleSTLFiles, formatFileSize } from "@/lib/api/stlUploadService";
import { getAllCategories } from "@/lib/api/categories";
import { getAllTags } from "@/lib/api/tags";
import { Category, Tag, Product } from "@/types/product";
import FileUploadZone from "@/components/studio/FileUploadZone";
import TagInput from "@/components/forms/TagInput";
import { processTagsForSubmission } from "@/lib/utils/tagUtils";
import { getSafeImageUrl } from "@/lib/utils/imageUtils";
import { 
  FaChevronRight, 
  FaInfoCircle, 
  FaImages, 
  FaCube, 
  FaDollarSign, 
  FaCog, 
  FaTags, 
  FaEye,
  FaSave, 
  FaChevronUp,
  FaChevronDown
} from 'react-icons/fa';

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
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    professional_license_fee: "",
    category: "",
    print_settings: "",
    dimensions: "",
    isPublic: true,
    isFree: false,
    enableProfessionalLicense: false,
    status: "draft" as "draft" | "published" | "withdrawn",
  });

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
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

  const loadCategories = async () => {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  const loadTags = async () => {
    try {
      await getAllTags();
    } catch (error) {
      console.error("Erreur lors du chargement des tags:", error);
    }
  };

  const loadProduct = useCallback(async () => {
    if (!productId) return;
    
    try {
      setLoadingProduct(true);
      const productData = await getProductByIdAuthenticated(productId);
      
      if (!productData) {
        showError("Produit introuvable");
        router.push(`/studio/${studioId}/products`);
        return;
      }

      // Check if product belongs to this studio
      const productStudioId = productData.creator.id;
        
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
        professional_license_fee: productData.professional_license_fee || "",
        category: productData.category && Array.isArray(productData.category) && productData.category.length > 0 ? productData.category[0].id.toString() : "",
        print_settings: productData.print_settings || "",
        dimensions: productData.dimensions || "",
        isPublic: productData.is_public !== undefined ? productData.is_public : true,
        isFree: parseFloat(productData.price) === 0,
        enableProfessionalLicense: !!(productData.professional_license_fee && parseFloat(productData.professional_license_fee) > 0),
        status: productData.status === "withdrawn" ? "draft" : productData.status,
      });

      // Set selected tags
      setSelectedTags(productData.tag || []);

      // Convert existing images to UploadedFile format with secure URL handling
      const existingImages = productData.images.map((img: { id: number; title?: string; url?: string; image?: string; rank: number }, index: number) => {
        // Use our utility function to build a safe image URL
        const imageUrl = getSafeImageUrl(img.url || img.image, '/placeholder-avatar.svg');
        
        return {
          id: `existing-img-${img.id}`,
          file: new File([], img.title || `Image ${index + 1}`),
          name: img.title || `Image ${index + 1}`,
          progress: 100,
          url: imageUrl || undefined, // Convert null to undefined for TypeScript compatibility
          isUploading: false,
          isMain: img.rank === 1,
        };
      });
      setUploadedImages(existingImages);

      // Convert existing STL files to UploadedFile format
      const existingSTLs = productData.stl_files.map((stl: { id: number; title: string; file: string }) => ({
        id: `existing-stl-${stl.id}`,
        file: new File([], stl.title),
        name: stl.title,
        progress: 100,
        url: stl.file,
        isUploading: false,
        originalId: stl.id, // Store original ID for deletion
      }));
      setUploadedSTLFiles(existingSTLs);

    } catch (error) {
      console.error("Erreur lors du chargement du produit:", error);
      showError("Erreur lors du chargement du produit");
    } finally {
      setLoadingProduct(false);
    }
  }, [productId, showError, router, studioId]);

  useEffect(() => {
    // Load categories and tags
    loadCategories();
    loadTags();
  }, []);

  useEffect(() => {
    // Load product data
    if (productId) {
      loadProduct();
    }
  }, [productId, loadProduct]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      
      // Si gratuit, mettre les prix à 0 et désactiver la licence pro
      if (name === 'isFree' && checked) {
        setFormData(prev => ({
          ...prev,
          price: "0.00",
          professional_license_fee: "0.00",
          enableProfessionalLicense: false
        }));
      }
      
      // Si on désactive la licence pro, vider le champ
      if (name === 'enableProfessionalLicense' && !checked) {
        setFormData(prev => ({
          ...prev,
          professional_license_fee: ""
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTagsChange = (tags: Tag[]) => {
    setSelectedTags(tags);
  };

  // Real file upload handlers
  const handleImagesAdded = async (files: File[]) => {
    if (!productId) return;

    const newImages = files.map(file => ({
      id: `img-${Date.now()}-${Math.random()}`,
      file,
      name: file.name.replace(/\.[^/.]+$/, ""),
      progress: 0,
      isUploading: true,
      isMain: uploadedImages.length === 0 && files[0] === file,
    }));

    setUploadedImages(prev => [...prev, ...newImages]);

    // Upload each file to the API
    for (const img of newImages) {
      try {
        console.log(`🖼️ Uploading image: ${img.name}`);
        
        // Update progress to show upload starting
        setUploadedImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, progress: 10 } : item
        ));

        const rank = uploadedImages.length + newImages.indexOf(img) + 1;
        const uploadResult = await uploadProductImage(productId, img.file, img.name, rank);
        
        console.log(`✅ Image uploaded successfully:`, uploadResult);

        // Update with success
        setUploadedImages(prev => prev.map(item => 
          item.id === img.id ? { 
            ...item, 
            progress: 100, 
            isUploading: false,
            url: URL.createObjectURL(img.file)
          } : item
        ));

      } catch (error: unknown) {
        console.error(`❌ Error uploading image ${img.name}:`, error);
        
        // Update with error
        setUploadedImages(prev => prev.map(item => 
          item.id === img.id ? { 
            ...item, 
            progress: 0, 
            isUploading: false,
            error: error instanceof Error ? error.message : 'Upload failed'
          } : item
        ));

        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        showError(`Erreur lors de l'upload de ${img.name}: ${errorMessage}`);
      }
    }
  };

  const handleSTLFilesAdded = async (files: File[]) => {
    if (!studioId) {
      showError("Studio ID manquant");
      return;
    }

    const newFiles = files.map(file => ({
      id: `stl-${Date.now()}-${Math.random()}`,
      file,
      name: file.name.replace(/\.[^/.]+$/, ""),
      progress: 0,
      isUploading: true,
      uploadComplete: false,
      fileSize: file.size,
      fileSizeDisplay: formatFileSize(file.size),
    }));

    setUploadedSTLFiles(prev => [...prev, ...newFiles]);

    // Upload files to GCS using the signed URLs service
    try {
      await uploadMultipleSTLFiles(
        studioId,
        files,
        // onFileProgress
        (fileIndex: number, progress) => {
          const fileId = newFiles[fileIndex].id;
          setUploadedSTLFiles(prev => prev.map(file => 
            file.id === fileId 
              ? { ...file, progress: progress.percentage }
              : file
          ));
        },
        // onFileComplete
        (fileIndex: number, objectKey: string) => {
          const fileId = newFiles[fileIndex].id;
          setUploadedSTLFiles(prev => prev.map(file => 
            file.id === fileId 
              ? { 
                  ...file, 
                  progress: 100, 
                  isUploading: false, 
                  uploadComplete: true,
                  object_key: objectKey 
                }
              : file
          ));
        },
        // onFileError
        (fileIndex: number, error: string) => {
          const fileId = newFiles[fileIndex].id;
          setUploadedSTLFiles(prev => prev.map(file => 
            file.id === fileId 
              ? { 
                  ...file, 
                  isUploading: false, 
                  uploadComplete: false,
                  uploadError: error,
                  error: error 
                }
              : file
          ));
        }
      );
    } catch (error) {
      console.error('Erreur lors de l\'upload STL:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      // Marquer tous les fichiers comme échoués
      newFiles.forEach(newFile => {
        setUploadedSTLFiles(prev => prev.map(file => 
          file.id === newFile.id 
            ? { 
                ...file, 
                isUploading: false, 
                uploadComplete: false,
                uploadError: errorMessage,
                error: errorMessage 
              }
            : file
        ));
      });
      
      showError(`Erreur lors de l'upload: ${errorMessage}`);
    }
  };

  const handleImageRemove = async (id: string) => {
    const imageToRemove = uploadedImages.find(img => img.id === id);
    if (!imageToRemove || !productId) return;

    // If it's an existing image, delete it from the API
    if (id.startsWith('existing-img-')) {
      const imageId = parseInt(id.replace('existing-img-', ''));
      try {
        console.log(`🗑️ Deleting image ${imageId} from API`);
        await deleteProductImage(productId, imageId);
        console.log(`✅ Image ${imageId} deleted successfully`);
      } catch (error: unknown) {
        console.error(`❌ Error deleting image ${imageId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
        showError(`Erreur lors de la suppression de l'image: ${errorMessage}`);
        return; // Don't remove from UI if API call failed
      }
    }

    setUploadedImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // If removed image was main, set first image as main
      if (filtered.length > 0 && imageToRemove.isMain) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const handleSTLRemove = async (id: string) => {
    const stlToRemove = uploadedSTLFiles.find(file => file.id === id);
    if (!stlToRemove || !productId) return;

    // If it's an existing STL file, delete it from the API
    if (id.startsWith('existing-stl-')) {
      const stlId = parseInt(id.replace('existing-stl-', ''));
      try {
        console.log(`🗑️ Deleting STL ${stlId} from API`);
        await deleteProductSTL(productId, stlId);
        console.log(`✅ STL ${stlId} deleted successfully`);
      } catch (error: unknown) {
        console.error(`❌ Error deleting STL ${stlId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
        showError(`Erreur lors de la suppression du fichier STL: ${errorMessage}`);
        return; // Don't remove from UI if API call failed
      }
    }

    setUploadedSTLFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleImageReorder = async (files: UploadedFile[]) => {
    setUploadedImages(files);
    
    // Save the new order to the backend (only for existing images)
    if (!productId) return;
    
    const existingImages = files.filter(file => file.id.startsWith('existing-img-'));
    if (existingImages.length === 0) return;
    
    try {
      const imageOrders = existingImages.map((file, index) => ({
        id: parseInt(file.id.replace('existing-img-', '')),
        rank: index + 1
      }));
      
      console.log('🔄 Updating image order:', imageOrders);
      await updateImageOrder(productId, imageOrders);
      console.log('✅ Image order updated successfully');
      
    } catch (error: unknown) {
      console.error('❌ Error updating image order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      showError(`Erreur lors de la mise à jour de l'ordre des images: ${errorMessage}`);
    }
  };

  const handleSTLReorder = (files: UploadedFile[]) => {
    setUploadedSTLFiles(files);
  };

  const handleMainImageSelect = async (id: string) => {
    if (!productId) return;

    // Only handle existing images (uploaded to the server)
    if (!id.startsWith('existing-img-')) {
      showError("Vous ne pouvez définir comme image principale que les images déjà uploadées");
      return;
    }

    const imageId = parseInt(id.replace('existing-img-', ''));
    
    try {
      console.log(`🖼️ Setting image ${imageId} as main image`);
      
      // Call the API to set the main image
      await setMainProductImage(productId, imageId);
      
      console.log(`✅ Main image set successfully`);
      
      // Update the UI
      setUploadedImages(prev => prev.map(img => ({
        ...img,
        isMain: img.id === id
      })));

      showSuccess("Image principale mise à jour avec succès!");
      
    } catch (error: unknown) {
      console.error(`❌ Error setting main image:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la définition';
      showError(`Erreur lors de la définition de l'image principale: ${errorMessage}`);
    }
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

    // Validation catégorie obligatoire
    if (!formData.category) {
      showError("Veuillez sélectionner une catégorie");
      return;
    }

    // Validation minimum 3 tags
    if (selectedTags.length < 3) {
      showError("Veuillez ajouter au moins 3 tags");
      return;
    }

    if (!formData.isFree) {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        showError("Le prix doit être supérieur à 0 pour un produit payant");
        return;
      }

      if (formData.enableProfessionalLicense) {
        if (!formData.professional_license_fee || parseFloat(formData.professional_license_fee) <= 0) {
          showError("Le montant de la licence professionnelle ne peut pas être de 0");
          return;
        }

        if (parseFloat(formData.professional_license_fee) < parseFloat(formData.price)) {
          showError("Le prix de la licence professionnelle ne peut pas être inférieur au prix personnel");
          return;
        }
      }
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
      // Prepare product data for ProductSerializer (used for updates)
      const productData: {
        name: string;
        description: string;
        price: string;
        professional_license_fee?: string;
        print_settings: string;
        dimensions: string;
        status: "draft" | "published" | "withdrawn";
        is_public: boolean;
        category_id?: number;
        tag_ids?: number[];
      } = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.isFree ? "0.00" : formData.price,
        professional_license_fee: formData.isFree ? undefined : (formData.enableProfessionalLicense && formData.professional_license_fee ? formData.professional_license_fee : undefined),
        print_settings: formData.print_settings.trim(),
        dimensions: formData.dimensions.trim(),
        status: formData.status,
        is_public: formData.isPublic,
      };

      // Add category if selected (ProductSerializer expects category_id)
      if (formData.category) {
        productData.category_id = parseInt(formData.category);
      }

      // Process tags (create new ones if needed) and get final tag IDs
      let finalTagIds: number[] = [];
      if (selectedTags.length > 0) {
        console.log('Processing tags before product update...');
        const tagResult = await processTagsForSubmission(selectedTags);
        
        if (tagResult.errors.length > 0) {
          throw new Error(`Erreur lors de la création des tags: ${tagResult.errors.join(', ')}`);
        }
        
        finalTagIds = tagResult.tagIds;
        productData.tag_ids = finalTagIds;
        console.log('Final tag IDs:', finalTagIds);
      }

      console.log('🔄 Updating product with data:', productData);

      await updateProduct(productId, productData);
      
      showSuccess("Produit mis à jour avec succès!");
      
      // Redirect to the studio products page
      router.push(`/studio/${studioId}/products`);
      
    } catch (error: unknown) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      
      let errorMessage = "Erreur lors de la mise à jour du produit";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: string;
              detail?: string;
            };
          };
        };
        errorMessage = axiosError.response?.data?.error || 
                      axiosError.response?.data?.detail || 
                      errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking studio or loading product
  if (myStudioLoading || !studioId || loadingProduct) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#F4F4F4] text-lg font-medium">Loading product...</div>
        </div>
      </div>
    );
  }

  // Don't render form if no studio access
  if (!myStudio || myStudio.studio.id !== studioId || !product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link 
              href={`/studio/${studioId}/products`}
              className="text-[#9ca3af] hover:text-primary transition-colors"
            >
              Products
            </Link>
            <FaChevronRight className="w-3 h-3 text-[#9ca3af]" />
            <span className="text-[#F4F4F4]">Edit Product</span>
          </nav>
          
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            <span className="text-primary">EDIT</span>
            <span className="text-white"> PRODUCT</span>
          </h1>
          <p className="text-[#9ca3af] text-base sm:text-lg">
            Modify your product for <span className="text-primary font-medium">{myStudio.studio.name}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          
          {/* Basic Information */}
          <div 
            className="rounded-xl p-6 sm:p-8"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <FaInfoCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F4F4]">
                  <span className="text-blue-400">BASIC</span>
                  <span className="text-white"> INFORMATION</span>
                </h2>
                <p className="text-[#9ca3af] text-sm">Essential details about your product</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  maxLength={128}
                  required
                  className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder-[#9ca3af]"
                  placeholder="Ex: Decorative 3D Vase"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder-[#9ca3af] resize-none"
                  placeholder="Describe your product..."
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div 
            className="rounded-xl p-6 sm:p-8"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <FaImages className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F4F4]">
                  <span className="text-green-400">PRODUCT</span>
                  <span className="text-white"> IMAGES</span>
                </h2>
                <p className="text-[#9ca3af] text-sm">Upload images to showcase your product</p>
              </div>
            </div>
            
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
              label="Upload Images"
              fileType="image"
            />
          </div>

          {/* STL Files */}
          <div 
            className="rounded-xl p-6 sm:p-8"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <FaCube className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F4F4]">
                  <span className="text-orange-400">STL</span>
                  <span className="text-white"> FILES</span>
                </h2>
                <p className="text-[#9ca3af] text-sm">Upload your 3D model files for printing</p>
              </div>
            </div>
            
            <FileUploadZone
              accept=".stl"
              multiple={true}
              onFilesAdded={handleSTLFilesAdded}
              uploadedFiles={uploadedSTLFiles}
              onFileRemove={handleSTLRemove}
              onFileReorder={handleSTLReorder}
              onFileRename={handleSTLRename}
              label="Upload STL Files"
              fileType="stl"
            />
          </div>

          {/* Pricing */}
          <div 
            className="rounded-xl p-6 sm:p-8"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <FaDollarSign className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F4F4]">
                  <span className="text-yellow-400">PRICING</span>
                  <span className="text-white"> OPTIONS</span>
                </h2>
                <p className="text-[#9ca3af] text-sm">Set your product pricing and licensing options</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {!formData.isFree && (
                <div className="space-y-6">
                  {/* Base price */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                      Base Price (€) *
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
                      placeholder="Ex: 4.99"
                      className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder-[#9ca3af]"
                    />
                    <p className="text-xs text-[#9ca3af] mt-2">
                      Price for personal use only
                    </p>
                  </div>

                  {/* Professional license toggle */}
                  <div className="p-4 rounded-lg bg-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="enableProfessionalLicense"
                            name="enableProfessionalLicense"
                            checked={formData.enableProfessionalLicense}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                        <div>
                          <label htmlFor="enableProfessionalLicense" className="text-sm font-semibold text-[#F4F4F4] cursor-pointer">
                            Offer Professional License
                          </label>
                          <p className="text-xs text-[#9ca3af]">
                            Allow commercial use with additional fee
                          </p>
                        </div>
                      </div>
                    </div>

                    {formData.enableProfessionalLicense && (
                      <div>
                        <label htmlFor="professional_license_fee" className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                          Professional License Fee (€) *
                        </label>
                        <input
                          type="number"
                          id="professional_license_fee"
                          name="professional_license_fee"
                          value={formData.professional_license_fee}
                          onChange={handleInputChange}
                          min={formData.price ? parseFloat(formData.price) : 0.01}
                          step="0.01"
                          required={formData.enableProfessionalLicense}
                          placeholder={formData.price ? `Minimum: ${formData.price}` : "Ex: 9.99"}
                          className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder-[#9ca3af]"
                        />
                        <p className="text-xs text-[#9ca3af] mt-2">
                          Must be equal or higher than personal price. Commercial price: {formData.professional_license_fee ? `${formData.professional_license_fee}€` : '0€'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Free product option */}
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="isFree"
                        name="isFree"
                        checked={formData.isFree}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    <div>
                      <label htmlFor="isFree" className="text-sm font-semibold text-[#F4F4F4] cursor-pointer">
                        Free Product
                      </label>
                      <p className="text-xs text-[#9ca3af]">
                        Offer this product for free to the community
                      </p>
                    </div>
                  </div>
                  {formData.isFree && (
                    <div className="bg-primary text-black px-3 py-1 rounded-full text-sm font-medium">
                      FREE
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details (Collapsible) */}
          <div 
            className="rounded-xl"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full p-6 sm:p-8 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <FaCog className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F4F4]">
                    <span className="text-purple-400">TECHNICAL</span>
                    <span className="text-white"> DETAILS</span>
                  </h2>
                  <p className="text-[#9ca3af] text-sm">Optional printing specifications and dimensions</p>
                </div>
              </div>
              {showTechnicalDetails ? (
                <FaChevronUp className="w-5 h-5 text-[#9ca3af]" />
              ) : (
                <FaChevronDown className="w-5 h-5 text-[#9ca3af]" />
              )}
            </button>
            
            {showTechnicalDetails && (
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-6">
                <div>
                  <label htmlFor="print_settings" className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                    Print Settings
                  </label>
                  <textarea
                    id="print_settings"
                    name="print_settings"
                    value={formData.print_settings}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder-[#9ca3af] resize-none"
                    placeholder="Ex: Layer height: 0.2mm, Infill: 20%"
                  />
                </div>

                <div>
                  <label htmlFor="dimensions" className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder-[#9ca3af]"
                    placeholder="Ex: Height: 200mm, Diameter: 100mm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Categorization */}
          <div 
            className="rounded-xl p-6 sm:p-8"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <FaTags className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F4F4]">
                  <span className="text-red-400">CATEGORIZATION</span>
                  <span className="text-white"> & TAGS</span>
                </h2>
                <p className="text-[#9ca3af] text-sm">Organize your product for better discoverability</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                  Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.id.toString() }))}
                      className={`p-3 rounded-lg border-2 transition-all text-center font-medium ${
                        formData.category === category.id.toString()
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-white/20 bg-white/5 hover:border-primary/50 text-[#9ca3af] hover:text-[#F4F4F4]'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                  Tags *
                </label>
                <TagInput
                  selectedTags={selectedTags}
                  onTagsChange={handleTagsChange}
                  maxTags={5}
                  placeholder="Type to search or create tags..."
                />
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div 
            className="rounded-xl p-6 sm:p-8"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
                <FaEye className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F4F4]">
                  <span className="text-gray-400">VISIBILITY</span>
                  <span className="text-white"> SETTINGS</span>
                </h2>
                <p className="text-[#9ca3af] text-sm">Control who can see and discover your product</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'published', isPublic: true }))}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.status === 'published' && formData.isPublic
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/20 bg-white/5 hover:border-primary/50 text-[#9ca3af]'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.status === 'published' && formData.isPublic ? 'border-primary bg-primary' : 'border-white/20'
                  }`}>
                    {formData.status === 'published' && formData.isPublic && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <span className="font-semibold">PUBLIC</span>
                </div>
                <p className="text-xs opacity-75">
                  Visible to all users in searches and catalogs
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'published', isPublic: false }))}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.status === 'published' && !formData.isPublic
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/20 bg-white/5 hover:border-primary/50 text-[#9ca3af]'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.status === 'published' && !formData.isPublic ? 'border-primary bg-primary' : 'border-white/20'
                  }`}>
                    {formData.status === 'published' && !formData.isPublic && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <span className="font-semibold">PRIVATE</span>
                </div>
                <p className="text-xs opacity-75">
                  Only visible via direct link, not listed in searches
                </p>
              </button>
            </div>
            
            {formData.status === 'draft' && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-400">
                    This product is currently in draft. Select &quot;Public&quot; or &quot;Private&quot; to make it visible.
                  </p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Link
              href={`/studio/${studioId}/products`}
              className="px-6 py-3 bg-white/10 text-[#F4F4F4] rounded-lg font-semibold hover:bg-white/20 transition-colors text-center"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary text-black rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Product...</span>
                </>
              ) : (
                <>
                  <FaSave className="w-5 h-5" />
                  <span>UPDATE PRODUCT</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
