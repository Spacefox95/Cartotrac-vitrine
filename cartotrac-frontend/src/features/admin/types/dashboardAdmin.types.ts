import type { components } from 'shared/api/generated/schema';

export type AdminDashboardTask = components['schemas']['DashboardTaskRead'];
export type AdminDashboardEvent = components['schemas']['DashboardEventRead'];
export type AdminDashboardNotification = components['schemas']['DashboardNotificationRead'];

export type AdminDashboardTaskPayload = components['schemas']['DashboardTaskCreate'];
export type AdminDashboardEventPayload = components['schemas']['DashboardEventCreate'];
export type AdminDashboardNotificationPayload = components['schemas']['DashboardNotificationCreate'];

export type AdminDashboardTaskListResponse = components['schemas']['DashboardTaskListResponse'];
export type AdminDashboardEventListResponse = components['schemas']['DashboardEventListResponse'];
export type AdminDashboardNotificationListResponse =
  components['schemas']['DashboardNotificationListResponse'];
