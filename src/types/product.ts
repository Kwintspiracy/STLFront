export interface Category {
  id: number;
  name: string;
}

export interface Studio {
  id: number;
  name: string;
  creatorlogo: string
}

export interface ProductImage {
  id: number;
  url: string;
  rank: number;
}

export interface ProductTag {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
  images: ProductImage[];
  category: Category[];
  tag:ProductTag[];
  creator: Studio; // ✅ corriger ici : plus Studio[]
  professionalLicenseFee: string;
  release_date: string;
  files?: string[];
}