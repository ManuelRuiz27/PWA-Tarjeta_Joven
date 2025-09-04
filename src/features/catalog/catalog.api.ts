import type { CatalogResponse, Merchant } from './types';

const BASE_URL = '/api';

function toQuery(params: Record<string, string | number | undefined>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

/**
 * Obtiene el catálogo de beneficios, filtrado por categoría y cercanía (near), con paginación.
 * GET /api/catalog?category=&near=&page=
 */
export function fetchCatalog(params: { category?: string; near?: string; page?: number }) {
  const qs = toQuery({ category: params.category, near: params.near, page: params.page });
  return request<CatalogResponse>(`${BASE_URL}/catalog${qs}`);
}

/**
 * Detalle del comercio por ID.
 * GET /api/merchants/:id
 */
export function fetchMerchant(id: string) {
  return request<Merchant>(`${BASE_URL}/merchants/${id}`);
}

