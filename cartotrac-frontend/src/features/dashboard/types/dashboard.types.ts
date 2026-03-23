export type DashboardSummary = {
  clients_total: number;
  quotes_total: number;
  draft_quotes_total: number;
  sent_quotes_total: number;
  pipeline_total_ttc: number;
  open_tasks_total: number;
  unread_notifications_total: number;
  today_events_total: number;
};

export type DashboardCalendar = {
  year: number;
  month: number;
  today: number;
  highlighted_days: number[];
};

export type DashboardTask = {
  id: number;
  title: string;
  description: string | null;
  due_at: string;
  status: string;
  priority: string;
  progress: number;
};

export type DashboardEvent = {
  id: number;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  category: string;
};

export type DashboardNotification = {
  id: number;
  sender: string;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  created_at: string;
};

export type DashboardRecentQuote = {
  id: number;
  reference: string;
  status: string;
  total_ttc: number;
  client_name: string;
};

export type DashboardResponse = {
  summary: DashboardSummary;
  calendar: DashboardCalendar;
  tasks: DashboardTask[];
  events: DashboardEvent[];
  notifications: DashboardNotification[];
  recent_quotes: DashboardRecentQuote[];
};
