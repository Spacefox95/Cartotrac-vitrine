export type Client = {
  id: number;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
};

export type ClientPayload = {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
};

export type ClientsListResponse = {
  items: Client[];
  total: number;
  limit: number;
  offset: number;
};
