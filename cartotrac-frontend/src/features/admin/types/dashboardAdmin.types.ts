export type AdminDashboardTask = {
  id: number;
  title: string;
  description: string | null;
  due_at: string;
  status: string;
  priority: string;
  progress: number;
};

export type AdminDashboardEvent = {
  id: number;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  category: string;
};

export type AdminDashboardNotification = {
  id: number;
  sender: string;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  created_at: string;
};

export type AdminDashboardTaskPayload = {
  title: string;
  description: string;
  due_at: string;
  status: string;
  priority: string;
  progress: number;
};

export type AdminDashboardEventPayload = {
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  category: string;
};

export type AdminDashboardNotificationPayload = {
  sender: string;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
};

export type AdminDashboardTaskListResponse = {
  items: AdminDashboardTask[];
  total: number;
};

export type AdminDashboardEventListResponse = {
  items: AdminDashboardEvent[];
  total: number;
};

export type AdminDashboardNotificationListResponse = {
  items: AdminDashboardNotification[];
  total: number;
};
