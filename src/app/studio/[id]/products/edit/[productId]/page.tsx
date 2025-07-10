"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useStudio } from "@/context/StudioContext";
import { useToast } from "@/context/ToastContext";
import { 
  getProductById, 
  updateProduct, 
  uploadProductImage, 
  uploadProductSTL, 
  deleteProductImage, 
  deleteProductSTL,
  setMainProductImage,
  updateImageOrder
} from "@/lib/api/products";
import { getAllCategories } from "@/lib/api/categories";
import { getAllTags } from "@/lib/api/tags";
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
  const [tags, setTags] = useState<Tag[]>([]);
  
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
    // Load categories and tags
    loadCategories();
    loadTags();
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

  const loadTags = async () => {
    try {
      const tagsData = await getAllTags();
      setTags(tagsData);
    } catch (error) {
      console.error("Erreur lors du chargement des tags:", error);
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
        professional_license_fee: productData.professional_license_fee,
        category: productData.category?.id?.toString() || "",
        print_settings: productData.print_settings || "",
        dimensions: productData.dimensions || "",
        isPublic: productData.is_public !== undefined ? productData.is_public : true,
        isFree: parseFloat(productData.price) === 0,
        enableProfessionalLicense: parseFloat(productData.professional_license_fee) > 0,
        status: productData.status === "withdrawn" ? "draft" : productData.status,
      });

      // Set selected tags
      setSelectedTags(productData.tags ? productData.tags.map(tag => tag.id) : []);

      // Convert existing images to UploadedFile format
      const existingImages = productData.images.map((img, index) => ({
        id: `existing-img-${img.id}`,
        file: new File([], img.title || `Image ${index + 1}`),
        name: img.title || `Image ${index + 1}`,
        progress: 100,
        url: img.url || img.image, // Support both new and legacy format
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
        originalId: stl.id, // Store original ID for deletion
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

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
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
            url: uploadResult.url || URL.createObjectURL(img.file)
          } : item
        ));

      } catch (error: any) {
        console.error(`❌ Error uploading image ${img.name}:`, error);
        
        // Update with error
        setUploadedImages(prev => prev.map(item => 
          item.id === img.id ? { 
            ...item, 
            progress: 0, 
            isUploading: false,
            error: error.message || 'Upload failed'
          } : item
        ));

        showError(`Erreur lors de l'upload de ${img.name}: ${error.message}`);
      }
    }
  };

  const handleSTLFilesAdded = async (files: File[]) => {
    if (!productId) return;

    const newFiles = files.map(file => ({
      id: `stl-${Date.now()}-${Math.random()}`,
      file,
      name: file.name.replace(/\.[^/.]+$/, ""),
      progress: 0,
      isUploading: true,
    }));

    setUploadedSTLFiles(prev => [...prev, ...newFiles]);

    // Upload each file to the API
    for (const stlFile of newFiles) {
      try {
        console.log(`📦 Uploading STL: ${stlFile.name}`);
        
        // Update progress to show upload starting
        setUploadedSTLFiles(prev => prev.map(item => 
          item.id === stlFile.id ? { ...item, progress: 10 } : item
        ));

        const uploadResult = await uploadProductSTL(productId, stlFile.file, stlFile.name);
        
        console.log(`✅ STL uploaded successfully:`, uploadResult);

        // Update with success
        setUploadedSTLFiles(prev => prev.map(item => 
          item.id === stlFile.id ? { 
            ...item, 
            progress: 100, 
            isUploading: false,
            url: uploadResult.file || uploadResult.url
          } : item
        ));

      } catch (error: any) {
        console.error(`❌ Error uploading STL ${stlFile.name}:`, error);
        
        // Update with error
        setUploadedSTLFiles(prev => prev.map(item => 
          item.id === stlFile.id ? { 
            ...item, 
            progress: 0, 
            isUploading: false,
            error: error.message || 'Upload failed'
          } : item
        ));

        showError(`Erreur lors de l'upload de ${stlFile.name}: ${error.message}`);
      }
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
      } catch (error: any) {
        console.error(`❌ Error deleting image ${imageId}:`, error);
        showError(`Erreur lors de la suppression de l'image: ${error.message}`);
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
      } catch (error: any) {
        console.error(`❌ Error deleting STL ${stlId}:`, error);
        showError(`Erreur lors de la suppression du fichier STL: ${error.message}`);
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
      
    } catch (error: any) {
      console.error('❌ Error updating image order:', error);
      showError(`Erreur lors de la mise à jour de l'ordre des images: ${error.message}`);
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
      
    } catch (error: any) {
      console.error(`❌ Error setting main image:`, error);
      showError(`Erreur lors de la définition de l'image principale: ${error.message}`);
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
      const productData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.isFree ? "0.00" : formData.price,
        professional_license_fee: formData.isFree ? null : (formData.enableProfessionalLicense && formData.professional_license_fee ? formData.professional_license_fee : null),
        print_settings: formData.print_settings.trim(),
        dimensions: formData.dimensions.trim(),
        status: formData.status,
        is_public: formData.isPublic,
      };

      // Add category if selected (ProductSerializer expects category_id)
      if (formData.category) {
        productData.category_id = parseInt(formData.category);
      }

      // Add selected tags (ProductSerializer expects tag_ids)
      if (selectedTags.length > 0) {
        productData.tag_ids = selectedTags;
      }

      console.log('🔄 Updating product with data:', productData);

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

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Statut de publication
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: 'published', isPublic: true }))}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.status === 'published' && formData.isPublic
                        ? 'border-[#FDD811] bg-[#FDD811]/10 text-[#FDD811]'
                        : 'border-[#2A2D30] bg-[#131618] hover:border-[#FDD811]/50 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.status === 'published' && formData.isPublic ? 'border-[#FDD811] bg-[#FDD811]' : 'border-[#2A2D30]'
                      }`}>
                        {formData.status === 'published' && formData.isPublic && (
                          <div className="w-full h-full rounded-full bg-black scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium">PUBLIÉ</span>
                    </div>
                    <p className="text-xs opacity-75">
                      Visible par tous les utilisateurs dans les recherches et catalogues
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: 'published', isPublic: false }))}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.status === 'published' && !formData.isPublic
                        ? 'border-[#FDD811] bg-[#FDD811]/10 text-[#FDD811]'
                        : 'border-[#2A2D30] bg-[#131618] hover:border-[#FDD811]/50 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.status === 'published' && !formData.isPublic ? 'border-[#FDD811] bg-[#FDD811]' : 'border-[#2A2D30]'
                      }`}>
                        {formData.status === 'published' && !formData.isPublic && (
                          <div className="w-full h-full rounded-full bg-black scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium">PRIVÉ</span>
                    </div>
                    <p className="text-xs opacity-75">
                      Visible uniquement via un lien direct, non listé dans les recherches
                    </p>
                  </button>
                </div>
                
                {formData.status === 'draft' && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-400">
                      Ce produit est actuellement en brouillon. Sélectionnez "Publié" ou "Privé" pour le rendre visible.
                    </p>
                  </div>
                )}
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
              {!formData.isFree && (
                <div className="space-y-6">
                  {/* Base price */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                      Prix de base (€) *
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
                      className="w-full bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#FDD811] transition-colors"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Prix pour usage personnel uniquement
                    </p>
                  </div>

                  {/* Professional license toggle */}
                  <div className="border border-[#2A2D30] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="enableProfessionalLicense"
                          name="enableProfessionalLicense"
                          checked={formData.enableProfessionalLicense}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#FDD811] bg-[#131618] border-[#2A2D30] rounded focus:ring-[#FDD811] focus:ring-2"
                        />
                        <div>
                          <label htmlFor="enableProfessionalLicense" className="text-sm font-medium text-white cursor-pointer">
                            Proposer une licence professionnelle
                          </label>
                          <p className="text-xs text-gray-400">
                            Permettre l'usage commercial avec un supplément
                          </p>
                        </div>
                      </div>
                    </div>

                    {formData.enableProfessionalLicense && (
                      <div>
                        <label htmlFor="professional_license_fee" className="block text-sm font-medium text-gray-300 mb-2">
                          Supplément licence professionnelle (€) *
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
                          className="w-full bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#FDD811] transition-colors"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Doit être supérieur ou égal au prix personnel. Prix pour usage commercial: {formData.professional_license_fee ? `${formData.professional_license_fee}€` : '0€'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Free product option - same styling as professional license */}
              <div className="border border-[#2A2D30] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isFree"
                      name="isFree"
                      checked={formData.isFree}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#FDD811] bg-[#131618] border-[#2A2D30] rounded focus:ring-[#FDD811] focus:ring-2"
                    />
                    <div>
                      <label htmlFor="isFree" className="text-sm font-medium text-white cursor-pointer">
                        Produit gratuit
                      </label>
                      <p className="text-xs text-gray-400">
                        Offrez ce produit gratuitement à la communauté
                      </p>
                    </div>
                  </div>
                  {formData.isFree && (
                    <div className="bg-gray-300 text-black px-3 py-1 rounded-full text-sm font-medium">
                      GRATUIT
                    </div>
                  )}
                </div>
              </div>
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
                  <span>VALIDER MODIFICATIONS</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
