import { http } from 'shared/api/http';

import type { DashboardResponse } from '../types/dashboard.types';

export async function getDashboardRequest(): Promise<DashboardResponse> {
  const response = await http.get<DashboardResponse>('/dashboard');

  return response.data;
}
