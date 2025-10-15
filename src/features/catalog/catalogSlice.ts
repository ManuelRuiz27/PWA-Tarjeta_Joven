import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { CatalogResponse, Merchant } from './types';

export interface CatalogQueryParams {
  category?: string;
  municipality?: string;
  q?: string;
  page?: number;
}

const trimParams = (params: Record<string, string | number | undefined>) => {
  const cleaned: Record<string, string | number> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

export const catalogApi = createApi({
  reducerPath: 'catalogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Catalog', 'Merchant'],
  endpoints: (builder) => ({
    getCatalog: builder.query<CatalogResponse, CatalogQueryParams>({
      query: ({ category, municipality, q, page }) => ({
        url: 'catalog',
        params: trimParams({
          categoria: category,
          municipio: municipality,
          q,
          page: page ?? 1,
        }),
      }),
      providesTags: (result) =>
        result
          ? [
              { type: 'Catalog' as const, id: 'LIST' },
              ...result.items.map((item) => ({ type: 'Merchant' as const, id: item.merchantId })),
            ]
          : [{ type: 'Catalog' as const, id: 'LIST' }],
      keepUnusedDataFor: 60,
    }),
    getMerchant: builder.query<Merchant, string>({
      query: (id) => ({
        url: `merchants/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Merchant' as const, id }],
    }),
  }),
});

export const {
  useGetCatalogQuery,
  useLazyGetCatalogQuery,
  useGetMerchantQuery,
  useLazyGetMerchantQuery,
} = catalogApi;

