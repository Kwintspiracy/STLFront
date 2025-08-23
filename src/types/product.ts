// Types alignés avec l'API Product

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  parent?: number; // Garde pour compatibilité
}

export interface Studio {
  id: number;
  name: string;
  slug?: string;
  badge?: string | null;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: number;
  url: string; // URL complète de l'image (l'API retourne 'url' et non 'image')
  image?: string; // Garde pour compatibilité avec l'ancien code
  rank: number;
  title: string;
  description?: string;
  width?: number;
  height?: number;
  created_at?: string;
}

export interface ProductSTL {
  id: number;
  file: string; // URL du fichier STL
  title: string;
  description?: string;
  rank?: number;
  file_size: number | null;
  file_size_display: string | null;
  created_at: string;
}

// New License System Types
export interface License {
  id: number;
  name: string;
  slug: string;
  license_type: string;
  short_description: string;
  full_terms: string;
  logo_url: string;
  external_url: string;
}

export interface ProductLicense {
  id: number;
  license: License;
  price: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string; // New field from API
  description?: string;
  price: string;
  professional_license_fee: string;
  creator: Studio; // L'API retourne toujours l'objet creator complet
  studio?: number | Studio; // Garde pour compatibilité avec l'ancien code
  status: 'draft' | 'published' | 'withdrawn';
  is_public?: boolean; // Visibilité du produit (public/privé)
  publication_date?: string;
  print_settings?: string;
  dimensions?: string;
  zip_file?: string | null;
  zip_size: string;
  zip_size_bytes: number;
  created_at: string;
  updated_at: string;
  tags?: Tag[]; // Pour compatibilité
  tag: Tag[]; // L'API retourne 'tag'
  category: Category[]; // Changed to array as per new API
  images: ProductImage[];
  stl_files: ProductSTL[];
  downloads: number; // New field from API
  views: number; // New field from API
  licenses: ProductLicense[]; // New license system
}

// Type pour la compatibilité avec l'ancien format (utilisé dans les mocks)
export interface LegacyProduct {
  id: number;
  name: string;
  price: string;
  description: string;
  images: Array<{
    id: number;
    url: string;
    rank: number;
  }>;
  category: Category[];
  tag: Tag[];
  creator: {
    id: number;
    name: string;
    creatorlogo: string;
  };
  professionalLicenseFee: string;
  release_date: string;
  files?: string[];
}

// Fonction helper pour convertir du format legacy vers le nouveau format
export function convertLegacyToProduct(legacy: LegacyProduct): Product {
  const studioData = {
    id: legacy.creator.id,
    name: legacy.creator.name,
    badge: legacy.creator.creatorlogo,
  };
  
  return {
    id: legacy.id,
    name: legacy.name,
    slug: legacy.name.toLowerCase().replace(/\s+/g, '-'), // Generate slug from name
    description: legacy.description,
    price: legacy.price,
    professional_license_fee: legacy.professionalLicenseFee,
    creator: studioData,
    studio: studioData, // Pour compatibilité
    status: 'published',
    publication_date: legacy.release_date,
    print_settings: '',
    dimensions: '',
    zip_file: null,
    zip_size: '',
    zip_size_bytes: 0,
    created_at: legacy.release_date,
    updated_at: legacy.release_date,
    tags: legacy.tag,
    tag: legacy.tag, // L'API retourne 'tag'
    category: legacy.category, // Keep as array for new API structure
    images: legacy.images.map(img => ({
      id: img.id,
      url: img.url,
      image: img.url, // Pour compatibilité
      rank: img.rank,
      title: `Image ${img.rank}`,
      description: '',
      width: 600,
      height: 600,
      created_at: legacy.release_date,
    })),
    stl_files: legacy.files?.map((file, index) => ({
      id: index + 1,
      file: file,
      title: file,
      description: '',
      rank: index + 1,
      file_size: 0,
      file_size_display: '',
      created_at: legacy.release_date,
    })) || [],
    downloads: 0, // Default value for legacy products
    views: 0, // Default value for legacy products
    licenses: [], // Default empty array for legacy products
  };
}

// Type pour les anciens composants (temporaire)
export type ProductTag = Tag;

// Helper functions for backward compatibility and license extraction
export function getPersonalPrice(product: Product): string {
  // First try to get from new license system
  if (product.licenses && product.licenses.length > 0) {
    const personalLicense = product.licenses.find(
      license => license.license.license_type === 'personal' || 
                 license.license.slug === 'personal' ||
                 license.license.name.toLowerCase().includes('personal')
    );
    if (personalLicense) {
      return personalLicense.price;
    }
  }
  
  // Fallback to legacy price field
  return product.price || '0.00';
}

export function getCommercialPrice(product: Product): string | null {
  // First try to get from new license system
  if (product.licenses && product.licenses.length > 0) {
    const commercialLicense = product.licenses.find(
      license => license.license.license_type === 'commercial' || 
                 license.license.license_type === 'cc_by_nc_sa' ||
                 license.license.slug === 'commercial' ||
                 license.license.name.toLowerCase().includes('commercial')
    );
    if (commercialLicense) {
      return commercialLicense.price;
    }
  }
  
  // Fallback to legacy professional_license_fee field
  if (product.professional_license_fee && parseFloat(product.professional_license_fee) > 0) {
    return product.professional_license_fee;
  }
  
  return null;
}

export function hasCommercialLicense(product: Product): boolean {
  return getCommercialPrice(product) !== null;
}

export function getPersonalLicense(product: Product): ProductLicense | null {
  if (product.licenses && product.licenses.length > 0) {
    return product.licenses.find(
      license => license.license.license_type === 'personal' || 
                 license.license.slug === 'personal' ||
                 license.license.name.toLowerCase().includes('personal')
    ) || null;
  }
  return null;
}

export function getCommercialLicense(product: Product): ProductLicense | null {
  if (product.licenses && product.licenses.length > 0) {
    return product.licenses.find(
      license => license.license.license_type === 'commercial' || 
                 license.license.license_type === 'cc_by_nc_sa' ||
                 license.license.slug === 'commercial' ||
                 license.license.name.toLowerCase().includes('commercial')
    ) || null;
  }
  return null;
}

export function isLegacyProduct(product: Product): boolean {
  return !product.licenses || product.licenses.length === 0;
}

export function getPrimaryCategory(product: Product): Category | undefined {
  if (Array.isArray(product.category) && product.category.length > 0) {
    return product.category[0];
  }
  return undefined;
}
