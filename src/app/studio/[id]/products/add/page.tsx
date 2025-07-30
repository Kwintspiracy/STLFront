'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useStudio } from "@/context/StudioContext";
import { useToast } from "@/context/ToastContext";
import { createProduct, uploadProductImage } from "@/lib/api/products";
import { getAllCategories } from "@/lib/api/categories";
import { getAllTags } from "@/lib/api/tags";
import { Category, Tag } from "@/types/product";
import { UploadedFile, UploadedSTLFile } from "@/types/upload";
import { uploadMultipleSTLFiles, formatFileSize } from "@/lib/api/stlUploadService";
import FileUploadZone from "@/components/studio/FileUploadZone";
import TagInput from "@/components/forms/TagInput";
import { processTagsForSubmission } from "@/lib/utils/tagUtils";
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
  params: Promise<{ id: string }>;
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

  const handleSTLFilesAdded = async (files: File[]) => {
    if (!studioId) {
      showError("Studio ID manquant");
      return;
    }

    const newFiles: UploadedSTLFile[] = files.map(file => ({
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

    // Upload files to GCS using the real service
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
                } as UploadedSTLFile
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
                } as UploadedSTLFile
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
              } as UploadedSTLFile
            : file
        ));
      });
      
      showError(`Erreur lors de l'upload: ${errorMessage}`);
    }
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

      // Prepare STL files data with object_keys
      const stlFilesData = uploadedSTLFiles
        .filter(file => (file as UploadedSTLFile).uploadComplete && (file as UploadedSTLFile).object_key)
        .map(file => {
          const stlFile = file as UploadedSTLFile;
          return {
            file_path: stlFile.object_key!,
            title: file.name,
            description: `Fichier STL: ${file.name}`
          };
        });

      // Prepare product data for ProductCreateSerializer
      const productData: Record<string, unknown> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.isFree ? "0.00" : formData.price,
        print_settings: formData.print_settings.trim(),
        dimensions: formData.dimensions.trim(),
        stl_files: stlFilesData,
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
      
      // Note: STL files are now uploaded directly to GCS during file selection
      // The object_keys are already stored in uploadedSTLFiles and will be
      // included in the product creation via stl_files parameter
      
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
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#F4F4F4] text-lg font-medium">Loading studio...</div>
        </div>
      </div>
    );
  }

  // Don't render form if no studio access
  if (!myStudio || myStudio.studio.id !== studioId) {
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
            <span className="text-[#F4F4F4]">Add Product</span>
          </nav>
          
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            <span className="text-primary">ADD</span>
            <span className="text-white"> PRODUCT</span>
          </h1>
          <p className="text-[#9ca3af] text-base sm:text-lg">
            Create a new product for <span className="text-primary font-medium">{myStudio.studio.name}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          
          {/* Basic Information */}
          <div 
            id="basic-info"
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
                {showValidationHighlight && validationErrors.name && (
                  <p className="text-red-400 text-sm mt-2">{validationErrors.name}</p>
                )}
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
            id="images"
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
            {showValidationHighlight && validationErrors.images && (
              <p className="text-red-400 text-sm mt-4">{validationErrors.images}</p>
            )}
          </div>

          {/* STL Files */}
          <div 
            id="stl-files"
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
            {showValidationHighlight && validationErrors.stl && (
              <p className="text-red-400 text-sm mt-4">{validationErrors.stl}</p>
            )}
          </div>

          {/* Pricing */}
          <div 
            id="pricing"
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
                    {showValidationHighlight && validationErrors.price && (
                      <p className="text-red-400 text-sm mt-2">{validationErrors.price}</p>
                    )}
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
                        {showValidationHighlight && validationErrors.professional_license_fee && (
                          <p className="text-red-400 text-sm mt-2">{validationErrors.professional_license_fee}</p>
                        )}
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
            id="categorization"
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
                {showValidationHighlight && validationErrors.category && (
                  <p className="text-red-400 text-sm mt-3">{validationErrors.category}</p>
                )}
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
                {showValidationHighlight && validationErrors.tags && (
                  <p className="text-red-400 text-sm mt-3">{validationErrors.tags}</p>
                )}
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
                onClick={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.isPublic
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/20 bg-white/5 hover:border-primary/50 text-[#9ca3af]'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.isPublic ? 'border-primary bg-primary' : 'border-white/20'
                  }`}>
                    {formData.isPublic && (
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
                onClick={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  !formData.isPublic
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/20 bg-white/5 hover:border-primary/50 text-[#9ca3af]'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    !formData.isPublic ? 'border-primary bg-primary' : 'border-white/20'
                  }`}>
                    {!formData.isPublic && (
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
                  <span>Creating Product...</span>
                </>
              ) : (
                <>
                  <FaSave className="w-5 h-5" />
                  <span>CREATE PRODUCT</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
