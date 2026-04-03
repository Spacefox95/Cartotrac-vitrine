import { http } from 'shared/api/http';

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
} from '../types/dashboardAdmin.types';

export async function fetchDashboardTasksRequest() {
  const response = await http.get<AdminDashboardTaskListResponse>('/dashboard/tasks');
  return response.data;
}

export async function createDashboardTaskRequest(payload: AdminDashboardTaskPayload) {
  const response = await http.post<AdminDashboardTask>('/dashboard/tasks', payload);
  return response.data;
}

export async function updateDashboardTaskRequest(taskId: number, payload: Partial<AdminDashboardTaskPayload>) {
  const response = await http.patch<AdminDashboardTask>('/dashboard/tasks/' + String(taskId), payload);
  return response.data;
}

export async function deleteDashboardTaskRequest(taskId: number) {
  await http.delete('/dashboard/tasks/' + String(taskId));
}

export async function fetchDashboardEventsRequest() {
  const response = await http.get<AdminDashboardEventListResponse>('/dashboard/events');
  return response.data;
}

export async function createDashboardEventRequest(payload: AdminDashboardEventPayload) {
  const response = await http.post<AdminDashboardEvent>('/dashboard/events', normalizeEventPayload(payload));
  return response.data;
}

export async function updateDashboardEventRequest(eventId: number, payload: Partial<AdminDashboardEventPayload>) {
  const response = await http.patch<AdminDashboardEvent>(
    '/dashboard/events/' + String(eventId),
    normalizeEventPayload(payload),
  );
  return response.data;
}

export async function deleteDashboardEventRequest(eventId: number) {
  await http.delete('/dashboard/events/' + String(eventId));
}

export async function fetchDashboardNotificationsRequest() {
  const response = await http.get<AdminDashboardNotificationListResponse>('/dashboard/notifications');
  return response.data;
}

export async function createDashboardNotificationRequest(payload: AdminDashboardNotificationPayload) {
  const response = await http.post<AdminDashboardNotification>('/dashboard/notifications', payload);
  return response.data;
}

export async function updateDashboardNotificationRequest(
  notificationId: number,
  payload: Partial<AdminDashboardNotificationPayload>,
) {
  const response = await http.patch<AdminDashboardNotification>(
    '/dashboard/notifications/' + String(notificationId),
    payload,
  );
  return response.data;
}

export async function deleteDashboardNotificationRequest(notificationId: number) {
  await http.delete('/dashboard/notifications/' + String(notificationId));
}

function normalizeEventPayload(payload: Partial<AdminDashboardEventPayload>) {
  const nextPayload = { ...payload };

  if (nextPayload.ends_at === '') {
    delete nextPayload.ends_at;
  }

  if (nextPayload.location !== undefined) {
    nextPayload.location = nextPayload.location.trim();
    if (nextPayload.location === '') {
      delete nextPayload.location;
    }
  }

  if (nextPayload.meeting_url !== undefined) {
    nextPayload.meeting_url = nextPayload.meeting_url.trim();
    if (nextPayload.meeting_url === '') {
      delete nextPayload.meeting_url;
    }
  }

  return nextPayload;
}
