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
  logo?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: number;
  image: string; // URL complète de l'image
  rank: number;
  title: string;
  description?: string;
  width: number;
  height: number;
  created_at: string;
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
  studio: number | Studio; // Peut être juste l'ID ou l'objet complet selon l'endpoint
  status: 'draft' | 'published' | 'withdrawn';
  publication_date?: string;
  print_settings?: string;
  dimensions?: string;
  zip_file?: string;
  zip_size: string;
  zip_size_bytes: number;
  created_at: string;
  updated_at: string;
  tags: Tag[];
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
  return {
    id: legacy.id,
    name: legacy.name,
    description: legacy.description,
    price: legacy.price,
    professional_license_fee: legacy.professionalLicenseFee,
    studio: {
      id: legacy.creator.id,
      name: legacy.creator.name,
      logo: legacy.creator.creatorlogo,
    },
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
    category: legacy.category[0], // Prendre la première catégorie
    images: legacy.images.map(img => ({
      id: img.id,
      image: img.url,
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
