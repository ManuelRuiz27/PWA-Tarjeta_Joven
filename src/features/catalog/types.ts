export interface Benefit {
  id: string;
  title: string;
  imageUrl: string;
  terms: string;
  validUntil: string; // ISO date
  merchantId: string;
  category: string;
}

export interface CatalogResponse {
  items: Benefit[];
  page: number;
  totalPages: number;
}

export interface Merchant {
  id: string;
  name: string;
  address?: string;
}

