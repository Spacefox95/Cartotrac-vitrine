export type Quote = {
  id: number;
  reference: string;
  client_id: number;
  status: string;
  total_ht: string;
  total_ttc: string;
};

export type QuotePayload = {
  reference: string;
  client_id: number;
  status: string;
  total_ht: string;
  total_ttc: string;
};

export type QuotesListResponse = {
  items: Quote[];
  total: number;
  limit: number;
  offset: number;
};
