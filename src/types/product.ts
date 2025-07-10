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
  parent?: number;
}

export interface Studio {
  id: number;
  name: string;
  slug?: string;
  badge?: string;
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
  rank: number;
  file_size: number;
  file_size_display: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
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
  zip_file?: string;
  zip_size: string;
  zip_size_bytes: number;
  created_at: string;
  updated_at: string;
  tags?: Tag[]; // Pour compatibilité
  tag: Tag[]; // L'API retourne 'tag'
  category?: Category;
  images: ProductImage[];
  stl_files: ProductSTL[];
  downloads?: number;
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
    description: legacy.description,
    price: legacy.price,
    professional_license_fee: legacy.professionalLicenseFee,
    creator: studioData,
    studio: studioData, // Pour compatibilité
    status: 'published',
    publication_date: legacy.release_date,
    print_settings: '',
    dimensions: '',
    zip_file: '',
    zip_size: '',
    zip_size_bytes: 0,
    created_at: legacy.release_date,
    updated_at: legacy.release_date,
    tags: legacy.tag,
    tag: legacy.tag, // L'API retourne 'tag'
    category: legacy.category[0], // Prendre la première catégorie
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
  };
}

// Type pour les anciens composants (temporaire)
export type ProductTag = Tag;
