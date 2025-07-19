'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useStudio } from "@/context/StudioContext";
import { useToast } from "@/context/ToastContext";
import { createProduct, uploadProductImage, uploadProductSTL } from "@/lib/api/products";
import { getAllCategories } from "@/lib/api/categories";
import { getAllTags } from "@/lib/api/tags";
import { Category, Tag } from "@/types/product";
import FileUploadZone from "@/components/studio/FileUploadZone";
import TagInput from "@/components/forms/TagInput";
import { processTagsForSubmission } from "@/lib/utils/tagUtils";
import { RiArrowLeftLine, RiArrowDownSLine, RiArrowUpSLine, RiSaveLine } from "react-icons/ri";

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
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    professional_license_fee: "",
    category: "",
    print_settings: "",
    dimensions: "",
    isFree: false,
    isPublic: true,
    enableProfessionalLicense: false,
  });

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  // File upload state
  const [uploadedImages, setUploadedImages] = useState<UploadedFile[]>([]);
  const [uploadedSTLFiles, setUploadedSTLFiles] = useState<UploadedFile[]>([]);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showValidationHighlight, setShowValidationHighlight] = useState(false);

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
        showError("Vous n&apos;avez pas accès à ce studio");
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

  // Validation function to check all required fields
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Check required fields
    if (!formData.name.trim()) {
      errors.name = "Le nom du produit est obligatoire";
    }
    
    if (!formData.category) {
      errors.category = "Veuillez sélectionner une catégorie";
    }
    
    if (selectedTags.length < 3) {
      errors.tags = "Veuillez ajouter au moins 3 tags";
    }
    
    if (uploadedImages.length === 0) {
      errors.images = "Veuillez ajouter au moins une image";
    }
    
    if (uploadedSTLFiles.length === 0) {
      errors.stl = "Veuillez ajouter au moins un fichier STL";
    }
    
    if (!formData.isFree) {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        errors.price = "Le prix doit être supérieur à 0 pour un produit payant";
      }
      
      if (formData.enableProfessionalLicense) {
        if (!formData.professional_license_fee || parseFloat(formData.professional_license_fee) <= 0) {
          errors.professional_license_fee = "Le montant de la licence professionnelle ne peut pas être de 0";
        }
        
        if (parseFloat(formData.professional_license_fee) < parseFloat(formData.price)) {
          errors.professional_license_fee = "Le prix de la licence professionnelle ne peut pas être inférieur au prix personnel";
        }
      }
    }
    
    // Check if files are still uploading
    const uploadingImages = uploadedImages.some(img => img.isUploading);
    const uploadingSTLs = uploadedSTLFiles.some(file => file.isUploading);
    
    if (uploadingImages || uploadingSTLs) {
      errors.upload = "Veuillez attendre la fin du téléchargement des fichiers";
    }
    
    return errors;
  };

  // Scroll to first error section
  const scrollToError = (errorKey: string) => {
    const sectionMap: {[key: string]: string} = {
      name: 'basic-info',
      category: 'categorization',
      tags: 'categorization',
      images: 'images',
      stl: 'stl-files',
      price: 'pricing',
      professional_license_fee: 'pricing',
      upload: 'images'
    };
    
    const sectionId = sectionMap[errorKey];
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Run validation
    const errors = validateForm();
    setValidationErrors(errors);
    setShowValidationHighlight(true);
    
    // If there are errors, show the first one and scroll to it
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      const firstErrorMessage = errors[firstErrorKey];
      
      showError(firstErrorMessage);
      scrollToError(firstErrorKey);
      return;
    }

    setLoading(true);
    
    try {
      // Check authentication before proceeding
      const { getAccessToken } = await import('@/lib/utils/tokenService');
      const token = getAccessToken();
      
      if (!token) {
        showError("Session expirée. Veuillez vous reconnecter pour créer un produit.");
        router.push("/auth/signin");
        return;
      }
      
      console.log('User is authenticated, proceeding with product creation...');

      // Prepare product data for ProductCreateSerializer
      const productData: {
        name: string;
        description: string;
        price: string;
        professional_license_fee?: string;
        print_settings: string;
        dimensions: string;
        category_id?: number;
        tag_ids?: number[];
      } = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.isFree ? "0.00" : formData.price,
        print_settings: formData.print_settings.trim(),
        dimensions: formData.dimensions.trim(),
      };

      // Add professional license fee if applicable
      if (!formData.isFree && formData.enableProfessionalLicense && formData.professional_license_fee) {
        productData.professional_license_fee = formData.professional_license_fee;
      }

      // Add category if selected (ProductCreateSerializer expects category_id)
      if (formData.category) {
        productData.category_id = parseInt(formData.category);
      }

      // Process tags (create new ones if needed) and get final tag IDs
      let finalTagIds: number[] = [];
      if (selectedTags.length > 0) {
        console.log('Processing tags before product creation...');
        const tagResult = await processTagsForSubmission(selectedTags);
        
        if (tagResult.errors.length > 0) {
          throw new Error(`Erreur lors de la création des tags: ${tagResult.errors.join(', ')}`);
        }
        
        finalTagIds = tagResult.tagIds;
        productData.tag_ids = finalTagIds;
        console.log('Final tag IDs:', finalTagIds);
      }

      // Create the product first
      console.log('Sending product data:', productData);
      console.log('Using token:', token ? 'Token present' : 'No token');
      const newProduct = await createProduct(productData);
      console.log('Created product:', newProduct);
      console.log('Product ID:', newProduct.id);
      
      if (!newProduct.id) {
        throw new Error('Product creation failed: No ID returned');
      }
      
      // Upload images
      for (const imageFile of uploadedImages) {
        try {
          await uploadProductImage(newProduct.id, imageFile.file, imageFile.name, uploadedImages.indexOf(imageFile) + 1);
        } catch (error) {
          console.error(`Failed to upload image ${imageFile.name}:`, error);
          // Continue with other uploads even if one fails
        }
      }
      
      // Upload STL files
      for (const stlFile of uploadedSTLFiles) {
        try {
          await uploadProductSTL(newProduct.id, stlFile.file, stlFile.name);
        } catch (error) {
          console.error(`Failed to upload STL file ${stlFile.name}:`, error);
          // Continue with other uploads even if one fails
        }
      }
      
      showSuccess("Produit créé avec succès!");
      
      // Redirect to the studio products page
      router.push(`/studio/${studioId}/products`);
      
    } catch (error: unknown) {
      console.error("Erreur lors de la création du produit:", error);
      
      let errorMessage = "Erreur lors de la création du produit";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              detail?: string;
              error?: string;
              non_field_errors?: string[] | string;
              [key: string]: unknown;
            };
          };
        };
        
        console.error("Error response:", axiosError.response);
        console.error("Error response data:", axiosError.response?.data);
        
        if (axiosError.response?.data) {
          const data = axiosError.response.data;
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (data.detail) {
            errorMessage = data.detail;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (data.non_field_errors) {
            errorMessage = Array.isArray(data.non_field_errors) ? data.non_field_errors.join(', ') : data.non_field_errors;
          } else {
            // Show field-specific errors
            const fieldErrors = Object.entries(data).map(([field, errors]) => {
              const errorList = Array.isArray(errors) ? errors : [errors];
              return `${field}: ${errorList.join(', ')}`;
            }).join('; ');
            if (fieldErrors) {
              errorMessage = fieldErrors;
            }
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div id="basic-info" className={`bg-background-secondary border rounded-lg p-6 ${
            showValidationHighlight && validationErrors.name ? 'border-red-500 bg-red-500/5' : 'border-border'
          }`}>
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Informations de base
              <span className="text-red-500 ml-1">*</span>
            </h2>
            
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
          <div id="images" className={`bg-background-secondary border rounded-lg p-6 ${
            showValidationHighlight && validationErrors.images ? 'border-red-500 bg-red-500/5' : 'border-border'
          }`}>
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Images du produit
              <span className="text-red-500 ml-1">*</span>
            </h2>
            
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
          <div id="stl-files" className={`bg-background-secondary border rounded-lg p-6 ${
            showValidationHighlight && validationErrors.stl ? 'border-red-500 bg-red-500/5' : 'border-border'
          }`}>
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Fichiers STL
              <span className="text-red-500 ml-1">*</span>
            </h2>
            
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
              {!formData.isFree && (
                <div className="space-y-6">
                  {/* Base price */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-text-secondary mb-2">
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
                      className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      Prix pour usage personnel uniquement
                    </p>
                  </div>

                  {/* Professional license toggle */}
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="enableProfessionalLicense"
                          name="enableProfessionalLicense"
                          checked={formData.enableProfessionalLicense}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent focus:ring-2"
                        />
                        <div>
                          <label htmlFor="enableProfessionalLicense" className="text-sm font-medium text-text-primary cursor-pointer">
                            Proposer une licence professionnelle
                          </label>
                          <p className="text-xs text-text-secondary">
                            Permettre l&apos;usage commercial avec un supplément
                          </p>
                        </div>
                      </div>
                    </div>

                    {formData.enableProfessionalLicense && (
                      <div>
                        <label htmlFor="professional_license_fee" className="block text-sm font-medium text-text-secondary mb-2">
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
                          className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors"
                        />
                        <p className="text-xs text-text-secondary mt-1">
                          Doit être supérieur ou égal au prix personnel. Prix pour usage commercial: {formData.professional_license_fee ? `${formData.professional_license_fee}€` : '0€'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Free product option - same styling as professional license */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isFree"
                      name="isFree"
                      checked={formData.isFree}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent focus:ring-2"
                    />
                    <div>
                      <label htmlFor="isFree" className="text-sm font-medium text-text-primary cursor-pointer">
                        Produit gratuit
                      </label>
                      <p className="text-xs text-text-secondary">
                        Offrez ce produit gratuitement à la communauté
                      </p>
                    </div>
                  </div>
                  {formData.isFree && (
                    <div className="bg-text-secondary text-background px-3 py-1 rounded-full text-sm font-medium">
                      GRATUIT
                    </div>
                  )}
                </div>
              </div>
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
          <div id="categorization" className={`bg-background-secondary border rounded-lg p-6 ${
            showValidationHighlight && (validationErrors.category || validationErrors.tags) ? 'border-red-500 bg-red-500/5' : 'border-border'
          }`}>
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Catégorisation
              <span className="text-red-500 ml-1">*</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Catégorie
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.id.toString() }))}
                      className={`p-3 rounded-lg border-2 transition-all text-center font-medium ${
                        formData.category === category.id.toString()
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border bg-background hover:border-accent/50 text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Tags
                </label>
                <TagInput
                  selectedTags={selectedTags}
                  onTagsChange={handleTagsChange}
                  maxTags={5}
                  placeholder="Tapez pour rechercher ou créer des tags..."
                />
              </div>
            </div>
          </div>


          {/* Visibility */}
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Visibilité</h2>
            <p className="text-sm text-text-secondary mb-4">
              Choisissez qui peut voir votre produit
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.isPublic
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-background hover:border-accent/50 text-text-secondary'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.isPublic ? 'border-accent bg-accent' : 'border-border'
                  }`}>
                    {formData.isPublic && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <span className="font-medium">PUBLIC</span>
                </div>
                <p className="text-xs opacity-75">
                  Visible par tous les utilisateurs dans les recherches et catalogues
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  !formData.isPublic
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-background hover:border-accent/50 text-text-secondary'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    !formData.isPublic ? 'border-accent bg-accent' : 'border-border'
                  }`}>
                    {!formData.isPublic && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <span className="font-medium">PRIVÉ</span>
                </div>
                <p className="text-xs opacity-75">
                  Visible uniquement via un lien direct, non listé dans les recherches
                </p>
              </button>
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
                  <span>Validation en cours...</span>
                </>
              ) : (
                <>
                  <RiSaveLine className="w-5 h-5" />
                  <span>VALIDER CREATION</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
