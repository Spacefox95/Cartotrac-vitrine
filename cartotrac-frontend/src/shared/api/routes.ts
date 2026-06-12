import type { paths } from './generated/schema';

type BackendPath = keyof paths;

const API_PREFIX = '/api/v1';

function route(path: BackendPath) {
  return path.replace(API_PREFIX, '');
}

export const apiRoutes = {
  authLogin: route('/api/v1/auth/login'),
  authLogout: route('/api/v1/auth/logout'),
  authMe: route('/api/v1/auth/me'),
  authRefresh: route('/api/v1/auth/refresh'),
  cartoAddressAutocomplete: route('/api/v1/carto/address/autocomplete'),
  cartoAddressReverse: route('/api/v1/carto/address/reverse'),
  cartoCadastreSearch: route('/api/v1/carto/cadastre/search'),
  clients: route('/api/v1/clients'),
  clientById: (clientId: number) => `${route('/api/v1/clients/{client_id}')}`.replace('{client_id}', String(clientId)),
  dashboard: route('/api/v1/dashboard'),
  dashboardEvents: route('/api/v1/dashboard/events'),
  dashboardEventById: (eventId: number) =>
    `${route('/api/v1/dashboard/events/{event_id}')}`.replace('{event_id}', String(eventId)),
  dashboardMessageContacts: route('/api/v1/dashboard/message-contacts'),
  dashboardMessages: route('/api/v1/dashboard/messages'),
  dashboardMessageRead: (messageId: number) =>
    `${route('/api/v1/dashboard/messages/{message_id}/read')}`.replace('{message_id}', String(messageId)),
  dashboardNotifications: route('/api/v1/dashboard/notifications'),
  dashboardNotificationById: (notificationId: number) =>
    `${route('/api/v1/dashboard/notifications/{notification_id}')}`.replace(
      '{notification_id}',
      String(notificationId),
    ),
  dashboardTasks: route('/api/v1/dashboard/tasks'),
  dashboardTaskById: (taskId: number) =>
    `${route('/api/v1/dashboard/tasks/{task_id}')}`.replace('{task_id}', String(taskId)),
  publicQuoteRequests: route('/api/v1/quote-requests/public'),
  quotes: route('/api/v1/quotes'),
  quoteById: (quoteId: number) => `${route('/api/v1/quotes/{quote_id}')}`.replace('{quote_id}', String(quoteId)),
  quotePdf: (quoteId: number) =>
    `${route('/api/v1/quotes/{quote_id}/pdf')}`.replace('{quote_id}', String(quoteId)),
  users: route('/api/v1/users'),
  userById: (userId: number) => `${route('/api/v1/users/{user_id}')}`.replace('{user_id}', String(userId)),
};
