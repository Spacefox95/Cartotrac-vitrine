import type {
  AdminDashboardEvent,
  AdminDashboardEventListResponse,
  AdminDashboardEventPayload,
  AdminDashboardNotification,
  AdminDashboardNotificationListResponse,
  AdminDashboardNotificationPayload,
  AdminDashboardTask,
  AdminDashboardTaskListResponse,
  AdminDashboardTaskPayload,
} from 'features/admin/types/dashboardAdmin.types';
import type { AdminUser, AdminUserPayload, AdminUsersListResponse } from 'features/admin/types/user.types';
import type { ClientsListResponse } from 'features/clients/types/client.types';
import type { QuotesListResponse } from 'features/quotes/types/quote.types';
import { http } from 'shared/api/http';
import { apiRoutes } from 'shared/api/routes';

import type { AppThunk } from './types';

type DashboardAdminContent = {
  tasks: AdminDashboardTaskListResponse;
  events: AdminDashboardEventListResponse;
  notifications: AdminDashboardNotificationListResponse;
  users: AdminUsersListResponse;
  clients: ClientsListResponse;
  quotes: QuotesListResponse;
};

export const fetchUsers = (): AppThunk<AdminUsersListResponse> => {
  return async () => {
    try {
      const response = await http.get<AdminUsersListResponse>(apiRoutes.users);
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const createUser = (payload: AdminUserPayload): AppThunk<AdminUser> => {
  return async () => {
    try {
      const response = await http.post<AdminUser>(apiRoutes.users, normalizeUserPayload(payload, false));
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const updateUser = ({
  userId,
  payload,
}: {
  userId: number;
  payload: AdminUserPayload;
}): AppThunk<AdminUser> => {
  return async () => {
    try {
      const response = await http.patch<AdminUser>(
        apiRoutes.userById(userId),
        normalizeUserPayload(payload, true),
      );

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const deleteUser = (userId: number): AppThunk => {
  return async () => {
    try {
      await http.delete(apiRoutes.userById(userId));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const fetchDashboardAdminContent = (): AppThunk<DashboardAdminContent> => {
  return async () => {
    try {
      const [tasks, events, notifications, users, clients, quotes] = await Promise.all([
        http.get<AdminDashboardTaskListResponse>(apiRoutes.dashboardTasks),
        http.get<AdminDashboardEventListResponse>(apiRoutes.dashboardEvents),
        http.get<AdminDashboardNotificationListResponse>(apiRoutes.dashboardNotifications),
        http.get<AdminUsersListResponse>(apiRoutes.users),
        http.get<ClientsListResponse>(apiRoutes.clients),
        http.get<QuotesListResponse>(apiRoutes.quotes),
      ]);

      return {
        tasks: tasks.data,
        events: events.data,
        notifications: notifications.data,
        users: users.data,
        clients: clients.data,
        quotes: quotes.data,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const createDashboardTask = (
  payload: AdminDashboardTaskPayload,
): AppThunk<AdminDashboardTask> => {
  return async () => {
    try {
      const response = await http.post<AdminDashboardTask>(apiRoutes.dashboardTasks, payload);
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const updateDashboardTask = ({
  taskId,
  payload,
}: {
  taskId: number;
  payload: Partial<AdminDashboardTaskPayload>;
}): AppThunk<AdminDashboardTask> => {
  return async () => {
    try {
      const response = await http.patch<AdminDashboardTask>(apiRoutes.dashboardTaskById(taskId), payload);
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const deleteDashboardTask = (taskId: number): AppThunk => {
  return async () => {
    try {
      await http.delete(apiRoutes.dashboardTaskById(taskId));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const createDashboardEvent = (
  payload: AdminDashboardEventPayload,
): AppThunk<AdminDashboardEvent> => {
  return async () => {
    try {
      const response = await http.post<AdminDashboardEvent>(
        apiRoutes.dashboardEvents,
        normalizeEventPayload(payload),
      );

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const updateDashboardEvent = ({
  eventId,
  payload,
}: {
  eventId: number;
  payload: Partial<AdminDashboardEventPayload>;
}): AppThunk<AdminDashboardEvent> => {
  return async () => {
    try {
      const response = await http.patch<AdminDashboardEvent>(
        apiRoutes.dashboardEventById(eventId),
        normalizeEventPayload(payload),
      );

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const deleteDashboardEvent = (eventId: number): AppThunk => {
  return async () => {
    try {
      await http.delete(apiRoutes.dashboardEventById(eventId));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const createDashboardNotification = (
  payload: AdminDashboardNotificationPayload,
): AppThunk<AdminDashboardNotification> => {
  return async () => {
    try {
      const response = await http.post<AdminDashboardNotification>(apiRoutes.dashboardNotifications, payload);
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const updateDashboardNotification = ({
  notificationId,
  payload,
}: {
  notificationId: number;
  payload: Partial<AdminDashboardNotificationPayload>;
}): AppThunk<AdminDashboardNotification> => {
  return async () => {
    try {
      const response = await http.patch<AdminDashboardNotification>(
        apiRoutes.dashboardNotificationById(notificationId),
        payload,
      );

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const deleteDashboardNotification = (notificationId: number): AppThunk => {
  return async () => {
    try {
      await http.delete(apiRoutes.dashboardNotificationById(notificationId));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

function normalizeUserPayload(payload: AdminUserPayload, isUpdate: boolean) {
  const base = {
    email: payload.email.trim(),
    full_name: payload.full_name?.trim() || null,
    role: payload.role,
  };

  if (isUpdate) {
    const password = payload.password?.trim();

    return {
      ...base,
      ...(password ? { password } : {}),
    };
  }

  return {
    ...base,
    password: payload.password,
  };
}

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
