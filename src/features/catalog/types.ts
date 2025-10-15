export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  municipality: string;
  discount: string;
  merchantId: string;
  imageUrl?: string;
  shortDescription?: string;
  address?: string;
  schedule?: string;
}

export interface CatalogFilters {
  categories: string[];
  municipalities: string[];
}

export interface CatalogResponse {
  items: CatalogItem[];
  page: number;
  totalPages: number;
  totalItems?: number;
  filters?: CatalogFilters;
}

export interface Merchant {
  id: string;
  name: string;
  address?: string;
  schedule?: string;
  description?: string;
  discount?: string;
  phone?: string;
  municipality?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
}

