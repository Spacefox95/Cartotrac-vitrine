import { http } from 'shared/api/http';

import type { Client, ClientPayload, ClientsListResponse } from '../types/client.types';

export async function fetchClientsRequest(search?: string) {
  const response = await http.get<ClientsListResponse>('/clients', {
    params: search ? { search } : undefined,
  });

  return response.data;
}

export async function fetchClientRequest(clientId: number) {
  const response = await http.get<Client>(`/clients/${clientId}`);

  return response.data;
}

export async function createClientRequest(payload: ClientPayload) {
  const response = await http.post<Client>('/clients', normalizePayload(payload));

  return response.data;
}

export async function updateClientRequest(clientId: number, payload: ClientPayload) {
  const response = await http.patch<Client>(
    `/clients/${clientId}`,
    normalizePayload(payload),
  );

  return response.data;
}

export async function deleteClientRequest(clientId: number) {
  await http.delete(`/clients/${clientId}`);
}

function normalizePayload(payload: ClientPayload) {
  return {
    company_name: payload.company_name.trim(),
    contact_name: payload.contact_name.trim() || null,
    email: payload.email.trim() || null,
    phone: payload.phone.trim() || null,
  };
}
