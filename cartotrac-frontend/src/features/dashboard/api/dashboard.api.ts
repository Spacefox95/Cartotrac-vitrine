import { http } from 'shared/api/http';

import type {
  DashboardMessageContactsResponse,
  DashboardMessageCreatePayload,
  DashboardNotification,
  DashboardResponse,
} from '../types/dashboard.types';

export async function getDashboardRequest(): Promise<DashboardResponse> {
  const response = await http.get<DashboardResponse>('/dashboard');

  return response.data;
}

export async function fetchDashboardMessageContactsRequest(): Promise<DashboardMessageContactsResponse> {
  const response = await http.get<DashboardMessageContactsResponse>('/dashboard/message-contacts');
  return response.data;
}

export async function fetchDashboardMessagesRequest(): Promise<DashboardNotification[]> {
  const response = await http.get<{ items: DashboardNotification[]; total: number }>('/dashboard/messages');
  return response.data.items;
}

export async function sendDashboardMessageRequest(
  payload: DashboardMessageCreatePayload,
): Promise<DashboardNotification> {
  const response = await http.post<DashboardNotification>('/dashboard/messages', payload);
  return response.data;
}

export async function markDashboardMessageReadRequest(messageId: number): Promise<DashboardNotification> {
  const response = await http.patch<DashboardNotification>(`/dashboard/messages/${messageId}/read`);
  return response.data;
}
