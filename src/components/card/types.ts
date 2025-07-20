import { Product } from "@/types/product";
import { ReactNode } from "react";

export type CardVariant = 'featured' | 'trending' | 'commercial' | 'standard';

export interface BaseProductCardProps {
  product: Product;
  variant?: CardVariant;
  className?: string;
}

export interface FeaturedProductCardProps extends BaseProductCardProps {
  variant: 'featured';
}

export interface TrendingProductCardProps extends BaseProductCardProps {
  variant: 'trending';
  ranking?: number;
  showDownloads?: boolean;
}

export interface CommercialLicenseCardProps extends BaseProductCardProps {
  variant: 'commercial';
  showCommercialPrice?: boolean;
}

export interface StandardProductCardProps extends BaseProductCardProps {
  variant: 'standard';
  showFavorite?: boolean;
}

export interface ProductSectionProps {
  title: string;
  icon: ReactNode;
  products: Product[];
  variant: CardVariant;
  description?: string;
  viewAllHref?: string;
  showRanking?: boolean;
  showDownloads?: boolean;
  showCommercialInfo?: boolean;
  className?: string;
}
