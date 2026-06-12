import type { AdminDashboardEventPayload } from 'features/admin/types/dashboardAdmin.types';
import type {
  DashboardMessageContactsResponse,
  DashboardMessageCreatePayload,
  DashboardEvent,
  DashboardEventListResponse,
  DashboardNotification,
  DashboardResponse,
} from 'features/dashboard/types/dashboard.types';
import { http } from 'shared/api/http';
import { apiRoutes } from 'shared/api/routes';

import type { AppThunk } from './types';

type DashboardMessagingResponse = {
  contacts: DashboardMessageContactsResponse;
  messages: DashboardNotification[];
};

export const fetchDashboard = (): AppThunk<DashboardResponse> => {
  return async () => {
    try {
      const response = await http.get<DashboardResponse>(apiRoutes.dashboard);
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const fetchDashboardMessaging = (): AppThunk<DashboardMessagingResponse> => {
  return async () => {
    try {
      const [contacts, messages] = await Promise.all([
        http.get<DashboardMessageContactsResponse>(apiRoutes.dashboardMessageContacts),
        http.get<{ items: DashboardNotification[]; total: number }>(apiRoutes.dashboardMessages),
      ]);

      return { contacts: contacts.data, messages: messages.data.items };
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const fetchDashboardMessages = (): AppThunk<DashboardNotification[]> => {
  return async () => {
    try {
      const response = await http.get<{ items: DashboardNotification[]; total: number }>(apiRoutes.dashboardMessages);
      return response.data.items;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const fetchDashboardEvents = (): AppThunk<DashboardEvent[]> => {
  return async () => {
    try {
      const response = await http.get<DashboardEventListResponse>(apiRoutes.dashboardEvents);
      return response.data.items;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const createDashboardCalendarEvent = (
  payload: AdminDashboardEventPayload,
): AppThunk<unknown> => {
  return async () => {
    try {
      const response = await http.post(apiRoutes.dashboardEvents, normalizeEventPayload(payload));
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const sendDashboardMessage = (
  payload: DashboardMessageCreatePayload,
): AppThunk<DashboardNotification> => {
  return async () => {
    try {
      const response = await http.post<DashboardNotification>(apiRoutes.dashboardMessages, payload);
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const markDashboardMessageRead = (messageId: number): AppThunk<DashboardNotification> => {
  return async () => {
    try {
      const response = await http.patch<DashboardNotification>(apiRoutes.dashboardMessageRead(messageId));
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

function normalizeEventPayload(payload: Partial<AdminDashboardEventPayload>) {
  const nextPayload = { ...payload };

  if (nextPayload.ends_at === '') {
    delete nextPayload.ends_at;
  }

  if (typeof nextPayload.location === 'string') {
    nextPayload.location = nextPayload.location.trim();
    if (nextPayload.location === '') {
      delete nextPayload.location;
    }
  }

  if (typeof nextPayload.meeting_url === 'string') {
    nextPayload.meeting_url = nextPayload.meeting_url.trim();
    if (nextPayload.meeting_url === '') {
      delete nextPayload.meeting_url;
    }
  }

  return nextPayload;
}
