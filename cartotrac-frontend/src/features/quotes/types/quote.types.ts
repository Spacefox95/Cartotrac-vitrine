export type QuoteCadastreContext = {
  saved_at?: string | null;
  address_label?: string | null;
  address_point?: [number, number] | null;
  search_kind?: 'commune' | 'parcelle' | null;
  source_url?: string | null;
  parcel_title?: string | null;
  parcel_subtitle?: string | null;
  parcel_area_label?: string | null;
  measured_area_sqm?: number | null;
  estimated_building_area_sqm?: number | null;
  trace_area_sqm?: number | null;
  trace_points?: Array<[number, number]>;
  preview_svg?: string | null;
};

export type Quote = {
  id: number;
  reference: string;
  client_id: number;
  status: string;
  total_ht: string;
  total_ttc: string;
  cadastre_context?: QuoteCadastreContext | null;
};

export type QuotePayload = {
  reference: string;
  client_id: number;
  status: string;
  total_ht: string;
  total_ttc: string;
  cadastre_context?: QuoteCadastreContext | null;
};

export type QuotesListResponse = {
  items: Quote[];
  total: number;
  limit: number;
  offset: number;
};
