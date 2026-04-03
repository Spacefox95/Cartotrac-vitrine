import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  CalendarMonth,
  Campaign,
  ChatBubbleOutline,
  DescriptionOutlined,
  EventAvailable,
  NorthEast,
  NotificationsNone,
  PeopleAltOutlined,
  Today,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from 'app/store/hooks';
import { createDashboardEventRequest } from 'features/admin/api/dashboardAdminApi';
import { fetchUsersRequest } from 'features/admin/api/usersApi';
import type { AdminDashboardEventPayload } from 'features/admin/types/dashboardAdmin.types';
import type { AdminUser } from 'features/admin/types/user.types';
import { hasPermission } from 'shared/auth/permissions';

import {
  fetchDashboardMessageContactsRequest,
  fetchDashboardMessagesRequest,
  getDashboardRequest,
  markDashboardMessageReadRequest,
  sendDashboardMessageRequest,
} from '../api/dashboard.api';
import { DashboardStatCard } from '../components/DashboardCards';
import type {
  DashboardEvent,
  DashboardMessageContact,
  DashboardMessageCreatePayload,
  DashboardNotification,
  DashboardResponse,
  DashboardTask,
} from '../types/dashboard.types';

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const monthNames = [
  'Janvier',
  'Fevrier',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Aout',
  'Septembre',
  'Octobre',
  'Novembre',
  'Decembre',
];

const priorityLabelMap: Record<string, string> = {
  high: 'Urgent',
  medium: 'Important',
  low: 'Suivi',
};

const priorityColorMap: Record<string, string> = {
  high: 'rgba(198, 40, 40, 0.08)',
  medium: 'rgba(21, 101, 192, 0.08)',
  low: 'rgba(0, 137, 123, 0.08)',
};

const emptyTasks: DashboardTask[] = [];
const emptyEvents: DashboardEvent[] = [];
const emptyNotifications: DashboardNotification[] = [];
const emptyRecentQuotes: DashboardResponse['recent_quotes'] = [];
const emptyEventDraft: AdminDashboardEventPayload = {
  title: '',
  description: '',
  starts_at: '',
  ends_at: '',
  category: 'meeting',
  assigned_user_id: null,
  location: '',
  meeting_url: '',
};
const emptyMessageDraft: DashboardMessageCreatePayload = {
  recipient_user_id: 0,
  title: '',
  message: '',
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const firstName = currentUser?.full_name?.split(' ')[0] ?? 'Equipe';
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canWriteQuotes = hasPermission(currentUser?.permissions, 'quotes:write');
  const canWriteClients = hasPermission(currentUser?.permissions, 'clients:write');
  const canManageDashboard = hasPermission(currentUser?.permissions, 'users:manage');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isEventSubmitting, setIsEventSubmitting] = useState(false);
  const [eventSubmitError, setEventSubmitError] = useState<string | null>(null);
  const [eventDraft, setEventDraft] = useState<AdminDashboardEventPayload>(emptyEventDraft);
  const [messageContacts, setMessageContacts] = useState<DashboardMessageContact[]>([]);
  const [messages, setMessages] = useState<DashboardNotification[]>([]);
  const [selectedConversationUserId, setSelectedConversationUserId] = useState<number | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isMessageSubmitting, setIsMessageSubmitting] = useState(false);
  const [messageSubmitError, setMessageSubmitError] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState<DashboardMessageCreatePayload>(emptyMessageDraft);
  const fallbackDate = new Date();

  const planningRoute = canManageDashboard ? '/app/admin/dashboard?tab=events' : '/app/dashboard';
  const alertsRoute = canManageDashboard ? '/app/admin/dashboard?tab=notifications' : '/app/dashboard';

  const quickActions = [
    {
      title: 'Nouveau devis',
      description: 'Créer directement une nouvelle proposition commerciale.',
      icon: <DescriptionOutlined fontSize="small" />,
      to: canWriteQuotes ? '/app/quotes/new' : '/app/quotes',
      helper: canWriteQuotes ? 'Ouvre la création de devis.' : 'Ouvre la liste des devis.',
      disabled: false,
    },
    {
      title: 'Nouveau client',
      description: 'Ajouter un compte client et lancer sa fiche.',
      icon: <PeopleAltOutlined fontSize="small" />,
      to: canWriteClients ? '/app/clients/new' : '/app/clients',
      helper: canWriteClients ? 'Ouvre la création de client.' : 'Ouvre la base clients.',
      disabled: false,
    },
    {
      title: 'Gérer planning',
      description: canManageDashboard
        ? 'Accéder à la gestion des événements du dashboard.'
        : 'Consulter le planning courant du tableau de bord.',
      icon: <EventAvailable fontSize="small" />,
      to: planningRoute,
      helper: canManageDashboard ? "Ouvre l'onglet événements." : "Reste sur le planning visible dans le dashboard.",
      disabled: false,
    },
    {
      title: "Centre d'alertes",
      description: canManageDashboard
        ? 'Piloter les notifications et messages internes.'
        : "Revenir au flux d'alertes et notifications affiche ici.",
      icon: <NotificationsNone fontSize="small" />,
      to: alertsRoute,
      helper: canManageDashboard ? "Ouvre l'onglet notifications." : "Reste sur la messagerie du dashboard.",
      disabled: false,
    },
  ];

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const response = await getDashboardRequest();

        if (isMounted) {
          setDashboard(response);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Impossible de charger le tableau de bord pour le moment.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (canManageDashboard === false) {
      return;
    }

    let isMounted = true;

    const loadUsers = async () => {
      try {
        const response = await fetchUsersRequest();
        if (isMounted) {
          setUsers(response.items);
        }
      } catch {
        if (isMounted) {
          setUsers([]);
        }
      }
    };

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, [canManageDashboard]);

  useEffect(() => {
    let isMounted = true;

    const loadMessaging = async () => {
      try {
        const [contactsResponse, messagesResponse] = await Promise.all([
          fetchDashboardMessageContactsRequest(),
          fetchDashboardMessagesRequest(),
        ]);
        if (isMounted) {
          setMessageContacts(contactsResponse.items);
          setMessages(messagesResponse);
          setMessageDraft((current) => ({
            ...current,
            recipient_user_id: current.recipient_user_id || contactsResponse.items[0]?.id || 0,
          }));
        }
      } catch {
        if (isMounted) {
          setMessageContacts([]);
          setMessages([]);
        }
      }
    };

    void loadMessaging();

    return () => {
      isMounted = false;
    };
  }, []);

  const calendarDays = useMemo(() => {
    if (dashboard === null) {
      return [] as Array<number | null>;
    }

    const firstDay = new Date(dashboard.calendar.year, dashboard.calendar.month - 1, 1);
    const jsWeekDay = firstDay.getDay();
    const mondayFirstOffset = (jsWeekDay + 6) % 7;
    const daysInMonth = new Date(dashboard.calendar.year, dashboard.calendar.month, 0).getDate();

    return [
      ...Array.from({ length: mondayFirstOffset }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [dashboard]);

  const summary = dashboard?.summary ?? {
    clients_total: 0,
    quotes_total: 0,
    draft_quotes_total: 0,
    sent_quotes_total: 0,
    pipeline_total_ttc: 0,
    open_tasks_total: 0,
    unread_notifications_total: 0,
    today_events_total: 0,
  };
  const calendar = dashboard?.calendar ?? {
    year: fallbackDate.getFullYear(),
    month: fallbackDate.getMonth() + 1,
    today: fallbackDate.getDate(),
    highlighted_days: [],
  };
  const tasks = dashboard?.tasks ?? emptyTasks;
  const events = dashboard?.events ?? emptyEvents;
  const notifications = dashboard?.notifications ?? emptyNotifications;
  const recentQuotes = dashboard?.recent_quotes ?? emptyRecentQuotes;
  const monthLabel = monthNames[calendar.month - 1] + ' ' + String(calendar.year);

  const eventsByDay = useMemo(() => {
    const grouped = new Map<number, DashboardEvent[]>();

    for (const event of events) {
      const eventDate = new Date(event.starts_at);
      const isSameMonth =
        eventDate.getFullYear() === calendar.year && eventDate.getMonth() === calendar.month - 1;

      if (isSameMonth === false) {
        continue;
      }

      const day = eventDate.getDate();
      const currentEvents = grouped.get(day) ?? [];
      currentEvents.push(event);
      grouped.set(day, currentEvents);
    }

    return grouped;
  }, [calendar.month, calendar.year, events]);

  useEffect(() => {
    const preferredDay =
      (selectedCalendarDay !== null && eventsByDay.has(selectedCalendarDay)) || selectedCalendarDay === calendar.today
        ? selectedCalendarDay
        : null;

    if (preferredDay !== null) {
      return;
    }

    const nextDay = eventsByDay.has(calendar.today)
      ? calendar.today
      : (Array.from(eventsByDay.keys()).sort((left, right) => left - right)[0] ?? calendar.today);

    setSelectedCalendarDay(nextDay);
  }, [calendar.today, eventsByDay, selectedCalendarDay]);

  const selectedDayEvents = useMemo(() => {
    if (selectedCalendarDay === null) {
      return [];
    }

    return eventsByDay.get(selectedCalendarDay) ?? [];
  }, [eventsByDay, selectedCalendarDay]);

  const selectedDayLabel =
    selectedCalendarDay === null
      ? monthLabel
      : new Intl.DateTimeFormat('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(new Date(calendar.year, calendar.month - 1, selectedCalendarDay));

  const conversationSummaries = useMemo(() => {
    return messageContacts
      .map((contact) => {
        const conversationMessages = messages.filter((message) => {
          const isOutgoing =
            message.sender_email === currentUser?.email && message.recipient_user_id === contact.id;
          const isIncoming =
            message.recipient_email === currentUser?.email && message.sender_user_id === contact.id;

          return isOutgoing || isIncoming;
        });

        const latestMessage = [...conversationMessages].sort(
          (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
        )[0] ?? null;

        const unreadCount = conversationMessages.filter(
          (message) => message.is_read === false && message.recipient_email === currentUser?.email,
        ).length;

        return {
          contact,
          latestMessage,
          unreadCount,
        };
      })
      .sort((left, right) => {
        if (left.unreadCount !== right.unreadCount) {
          return right.unreadCount - left.unreadCount;
        }

        const leftTime = left.latestMessage ? new Date(left.latestMessage.created_at).getTime() : 0;
        const rightTime = right.latestMessage ? new Date(right.latestMessage.created_at).getTime() : 0;

        return rightTime - leftTime;
      });
  }, [currentUser?.email, messageContacts, messages]);

  useEffect(() => {
    const fallbackContactId = conversationSummaries[0]?.contact.id ?? messageContacts[0]?.id ?? null;

    if (selectedConversationUserId === null || conversationSummaries.every((item) => item.contact.id !== selectedConversationUserId)) {
      setSelectedConversationUserId(fallbackContactId);
    }
  }, [conversationSummaries, messageContacts, selectedConversationUserId]);

  const selectedConversation = useMemo(
    () =>
      conversationSummaries.find((item) => item.contact.id === selectedConversationUserId) ?? null,
    [conversationSummaries, selectedConversationUserId],
  );

  const conversationMessages = useMemo(() => {
    if (selectedConversationUserId === null) {
      return [];
    }

    return [...messages]
      .filter((message) => {
        const isOutgoing =
          message.sender_email === currentUser?.email && message.recipient_user_id === selectedConversationUserId;
        const isIncoming =
          message.recipient_email === currentUser?.email && message.sender_user_id === selectedConversationUserId;

        return isOutgoing || isIncoming;
      })
      .sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());
  }, [currentUser?.email, messages, selectedConversationUserId]);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await getDashboardRequest();
      setDashboard(response);
    } catch {
      setErrorMessage('Impossible de charger le tableau de bord pour le moment.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetchDashboardMessagesRequest();
      setMessages(response);
    } catch {
      setErrorMessage('Impossible de charger la messagerie pour le moment.');
    }
  };

  const openEventDialogForDay = (day: number) => {
    const startDate = new Date(calendar.year, calendar.month - 1, day, 9, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 45);

    setEventSubmitError(null);
    setEventDraft({
      ...emptyEventDraft,
      starts_at: toDateTimeLocalInput(startDate),
      ends_at: toDateTimeLocalInput(endDate),
    });
    setIsEventDialogOpen(true);
  };

  const handleCalendarDayClick = (day: number | null) => {
    if (day === null) {
      return;
    }

    setSelectedCalendarDay(day);

    if (canManageDashboard === false) {
      return;
    }

    openEventDialogForDay(day);
  };

  const handleCreateEvent = async () => {
    try {
      setIsEventSubmitting(true);
      setEventSubmitError(null);
      await createDashboardEventRequest({
        ...eventDraft,
        starts_at: new Date(eventDraft.starts_at).toISOString(),
        ends_at: eventDraft.ends_at ? new Date(eventDraft.ends_at).toISOString() : '',
      });
      setIsEventDialogOpen(false);
      await loadDashboard();
    } catch {
      setEventSubmitError("Impossible d'enregistrer cet événement pour le moment.");
    } finally {
      setIsEventSubmitting(false);
    }
  };

  const openMessageDialog = (recipientUserId?: number) => {
    setMessageSubmitError(null);
    setMessageDraft({
      ...emptyMessageDraft,
      recipient_user_id: recipientUserId ?? selectedConversationUserId ?? messageContacts[0]?.id ?? 0,
    });
    setIsMessageDialogOpen(true);
  };

  const handleSendMessage = async () => {
    try {
      setIsMessageSubmitting(true);
      setMessageSubmitError(null);
      await sendDashboardMessageRequest(messageDraft);
      setIsMessageDialogOpen(false);
      await Promise.all([loadDashboard(), loadMessages()]);
    } catch {
      setMessageSubmitError("Impossible d'envoyer ce message pour le moment.");
    } finally {
      setIsMessageSubmitting(false);
    }
  };

  const handleMarkMessageRead = async (messageId: number) => {
    try {
      await markDashboardMessageReadRequest(messageId);
      await Promise.all([loadDashboard(), loadMessages()]);
    } catch {
      setErrorMessage('Impossible de mettre ce message à jour.');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (dashboard === null) {
    return <Alert severity="error">{errorMessage ?? 'Le tableau de bord est indisponible.'}</Alert>;
  }

  return (
    <>
      <Stack spacing={3.5}>
      <Paper
        elevation={0}
        sx={{
          overflow: 'hidden',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          background:
            'radial-gradient(circle at top left, rgba(21, 101, 192, 0.22), transparent 34%), linear-gradient(135deg, #0d1b2a 0%, #13345b 45%, #1f6fb2 100%)',
          color: '#fff',
        }}
      >
        <Grid container>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={2.5} sx={{ p: { xs: 3, md: 4.5 } }}>
              <Chip
                icon={<Today sx={{ color: '#fff !important' }} />}
                label={new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                sx={{
                  alignSelf: 'flex-start',
                  bgcolor: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                }}
              />
              <Box>
                <Typography variant="h2" sx={{ maxWidth: 640, mb: 1.25, color: '#fff' }}>
                  Bonjour {firstName}, voici votre tour de contrôle Cartotrac.
                </Typography>
                <Typography sx={{ maxWidth: 620, color: 'rgba(255,255,255,0.8)', fontSize: '1.02rem' }}>
                  Vous avez {summary.today_events_total} rendez-vous planifiés, {summary.open_tasks_total}{' '}
                  tâches ouvertes et {summary.unread_notifications_total} notifications à surveiller.
                </Typography>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant="contained"
                  endIcon={<NorthEast />}
                  onClick={() => navigate(planningRoute)}
                  sx={{
                    bgcolor: '#fff',
                    color: '#0d1b2a',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
                  }}
                >
                  Ouvrir le planning du jour
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Campaign />}
                  onClick={() => navigate(alertsRoute)}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: '#fff',
                  }}
                >
                  Voir les alertes internes
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack
              spacing={2}
              sx={{
                height: '100%',
                p: { xs: 3, md: 4 },
                bgcolor: 'rgba(7, 14, 24, 0.22)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography variant="overline" sx={{ letterSpacing: '0.12em', color: 'rgba(255,255,255,0.72)' }}>
                Flash opérations
              </Typography>
              <Stack spacing={1.25}>
                <HeroMetric
                  icon={<NotificationsNone />}
                  value={String(summary.unread_notifications_total)}
                  label="notifications non lues"
                />
                <HeroMetric
                  icon={<ChatBubbleOutline />}
                  value={String(notifications.length)}
                  label="messages et alertes récents"
                />
                <HeroMetric
                  icon={<CalendarMonth />}
                  value={String(summary.today_events_total)}
                  label="événements planifiés aujourd'hui"
                />
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <DashboardStatCard
            title="Pipeline commercial"
            value={formatCurrency(summary.pipeline_total_ttc)}
            subtitle={String(summary.quotes_total) + ' devis actifs, dont ' + String(summary.draft_quotes_total) + ' brouillons'}
            tone="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <DashboardStatCard
            title="Calendrier"
            value={String(summary.today_events_total)}
            subtitle="événements programmés pour aujourd'hui"
            tone="teal"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <DashboardStatCard
            title="Notifications"
            value={String(summary.unread_notifications_total)}
            subtitle={String(notifications.length) + ' éléments récents dans le flux interne'}
            tone="amber"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <DashboardStatCard
            title="Portefeuille clients"
            value={String(summary.clients_total)}
            subtitle={String(summary.sent_quotes_total) + ' devis envoyés et suivis commerciaux'}
            tone="rose"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, xl: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)',
              height: '100%',
            }}
          >
            <Stack spacing={2.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5">Calendrier</Typography>
                  <Typography color="text.secondary">{monthLabel}</Typography>
                </Box>
                <Chip icon={<CalendarMonth />} label={String(events.length) + ' à venir'} variant="outlined" />
              </Stack>

              <Grid container columns={7} spacing={1}>
                {weekDays.map((day) => (
                  <Grid key={day} size={1}>
                    <Typography align="center" variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {day}
                    </Typography>
                  </Grid>
                ))}
                {calendarDays.map((day, index) => {
                  const isToday = day === calendar.today;
                  const hasEvent = day !== null && calendar.highlighted_days.includes(day);
                  const isSelected = day !== null && day === selectedCalendarDay;

                  return (
                    <Grid key={day === null ? 'empty-' + String(index) : day} size={1}>
                      <ButtonBase
                        disabled={day === null}
                        onClick={() => handleCalendarDayClick(day)}
                        sx={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            display: 'grid',
                            placeItems: 'center',
                            border: day ? '1px solid rgba(15, 23, 42, 0.08)' : '1px dashed transparent',
                            bgcolor: isToday
                              ? '#1565c0'
                              : isSelected
                                ? 'rgba(21, 101, 192, 0.14)'
                                : hasEvent
                                  ? 'rgba(21, 101, 192, 0.08)'
                                  : 'transparent',
                            color: isToday ? '#fff' : 'text.primary',
                            fontWeight: isToday || isSelected ? 800 : 600,
                            boxShadow: isSelected ? 'inset 0 0 0 2px rgba(21, 101, 192, 0.35)' : 'none',
                            transition: 'all 160ms ease',
                          }}
                        >
                          {day ?? ''}
                        </Box>
                      </ButtonBase>
                    </Grid>
                  );
                })}
              </Grid>

              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                <Box>
                  <Typography variant="h6">Programme du {selectedDayLabel}</Typography>
                  <Typography color="text.secondary">
                    {selectedDayEvents.length} rendez-vous planifié{selectedDayEvents.length > 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1.25}>
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => <EventRow key={event.id} event={event} />)
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px dashed rgba(15, 23, 42, 0.16)',
                      bgcolor: 'rgba(247, 249, 252, 0.72)',
                    }}
                  >
                    <Typography fontWeight={700}>Aucun événement planifié</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sélectionnez un autre jour ou cliquez sur une date pour programmer un rendez-vous.
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, xl: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              height: '100%',
            }}
          >
            <Stack spacing={2.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5">Tâches à faire</Typography>
                  <Typography color="text.secondary">Priorités synchronisées depuis l'API</Typography>
                </Box>
                <Chip label={String(summary.open_tasks_total) + ' ouvertes'} color="warning" variant="outlined" />
              </Stack>

              <Stack spacing={2}>
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, xl: 4 }}>
          <Stack spacing={2.5} height="100%">
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid rgba(15, 23, 42, 0.08)',
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h5">Messagerie</Typography>
                    <Typography color="text.secondary">Conversations équipe et alertes utiles</Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={String(summary.unread_notifications_total) + ' non lus'} color="primary" variant="outlined" />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openMessageDialog()}
                      disabled={messageContacts.length === 0}
                    >
                      Nouveau message
                    </Button>
                  </Stack>
                </Stack>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Stack spacing={1}>
                      {conversationSummaries.map(({ contact, latestMessage, unreadCount }) => {
                        const isSelected = contact.id === selectedConversationUserId;

                        return (
                          <ButtonBase
                            key={contact.id}
                            onClick={() => setSelectedConversationUserId(contact.id)}
                            sx={{ width: '100%', textAlign: 'left' }}
                          >
                            <Box
                              sx={{
                                width: '100%',
                                p: 1.5,
                                borderRadius: 1,
                                border: '1px solid rgba(15, 23, 42, 0.08)',
                                bgcolor: isSelected ? 'rgba(21, 101, 192, 0.08)' : '#fff',
                              }}
                            >
                              <Stack direction="row" spacing={1.25} alignItems="center">
                                <Avatar sx={{ bgcolor: unreadCount > 0 ? '#1565c0' : 'rgba(15, 23, 42, 0.12)' }}>
                                  {(contact.full_name ?? contact.email).charAt(0)}
                                </Avatar>
                                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                                    <Typography fontWeight={700} noWrap>
                                      {contact.full_name ?? contact.email}
                                    </Typography>
                                    {unreadCount > 0 ? <Chip label={String(unreadCount)} size="small" color="primary" /> : null}
                                  </Stack>
                                  <Typography variant="body2" color="text.secondary" noWrap>
                                    {latestMessage
                                      ? latestMessage.title.trim() || latestMessage.message
                                      : 'Aucune conversation'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </ButtonBase>
                        );
                      })}
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, md: 7 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        minHeight: 280,
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        bgcolor: 'rgba(247, 249, 252, 0.72)',
                      }}
                    >
                      {selectedConversation ? (
                        <Stack spacing={1.5}>
                          <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
                            <Box>
                              <Typography fontWeight={700}>
                                {selectedConversation.contact.full_name ?? selectedConversation.contact.email}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {selectedConversation.contact.role}
                              </Typography>
                            </Box>
                            <Button size="small" onClick={() => openMessageDialog(selectedConversation.contact.id)}>
                              Répondre
                            </Button>
                          </Stack>

                          <Stack spacing={1}>
                            {conversationMessages.length > 0 ? (
                              conversationMessages.map((message) => {
                                const isMine = message.sender_email === currentUser?.email;

                                return (
                                  <Stack
                                    key={message.id}
                                    alignItems={isMine ? 'flex-end' : 'flex-start'}
                                    spacing={0.5}
                                  >
                                    <Box
                                      sx={{
                                        maxWidth: '100%',
                                        px: 1.5,
                                        py: 1.25,
                                        borderRadius: 1,
                                        bgcolor: isMine ? '#1565c0' : '#fff',
                                        color: isMine ? '#fff' : 'text.primary',
                                        border: isMine ? 'none' : '1px solid rgba(15, 23, 42, 0.08)',
                                      }}
                                    >
                                      {message.title.trim() ? (
                                        <Typography fontWeight={700} sx={{ mb: 0.35 }}>
                                          {message.title}
                                        </Typography>
                                      ) : null}
                                      <Typography variant="body2">{message.message}</Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Typography variant="caption" color="text.secondary">
                                        {formatTimeAgo(message.created_at)}
                                      </Typography>
                                      {message.is_read === false && message.recipient_email === currentUser?.email ? (
                                        <Button size="small" onClick={() => void handleMarkMessageRead(message.id)}>
                                          Marquer lu
                                        </Button>
                                      ) : null}
                                    </Stack>
                                  </Stack>
                                );
                              })
                            ) : (
                              <Box sx={{ py: 4 }}>
                                <Typography fontWeight={700}>Aucun échange pour le moment</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Lancez la conversation avec ce contact directement depuis le dashboard.
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </Stack>
                      ) : (
                        <Box sx={{ py: 4 }}>
                          <Typography fontWeight={700}>Aucun contact sélectionné</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Choisissez un contact pour afficher la conversation.
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid rgba(15, 23, 42, 0.08)',
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h5">Devis récents</Typography>
                <Stack spacing={1.25}>
                  {recentQuotes.map((quote) => (
                    <Box
                      key={quote.id}
                      sx={{
                        p: 1.75,
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        bgcolor: 'rgba(247, 249, 252, 0.72)',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Box>
                          <Typography fontWeight={700}>{quote.reference}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {quote.client_name}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Chip label={quote.status} size="small" sx={{ mb: 0.75, textTransform: 'capitalize' }} />
                          <Typography variant="body2" fontWeight={700}>
                            {formatCurrency(quote.total_ttc)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid rgba(15, 23, 42, 0.08)',
                flexGrow: 1,
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h5">Actions rapides</Typography>
                <Grid container spacing={1.5}>
                  {quickActions.map((action) => (
                    <Grid key={action.title} size={{ xs: 12, sm: 6 }}>
                      <ButtonBase
                        onClick={() => navigate(action.to)}
                        sx={{
                          width: '100%',
                          display: 'block',
                          textAlign: 'left',
                        }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            height: '100%',
                            border: '1px solid rgba(15, 23, 42, 0.08)',
                            bgcolor: 'rgba(247, 249, 252, 0.9)',
                            transition: 'transform 160ms ease, box-shadow 160ms ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 10px 26px rgba(21, 101, 192, 0.12)',
                            },
                          }}
                        >
                          <Stack spacing={1.25}>
                            <Avatar sx={{ bgcolor: 'rgba(21, 101, 192, 0.12)', color: '#1565c0' }}>
                              {action.icon}
                            </Avatar>
                            <Typography fontWeight={700}>{action.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {action.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {action.helper}
                            </Typography>
                          </Stack>
                        </Paper>
                      </ButtonBase>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
      </Stack>
      <Dialog open={isEventDialogOpen} onClose={() => setIsEventDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Programmer un événement</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Titre"
                  value={eventDraft.title}
                  onChange={(event) => setEventDraft((current) => ({ ...current, title: event.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Catégorie"
                  value={eventDraft.category}
                  onChange={(event) => setEventDraft((current) => ({ ...current, category: event.target.value }))}
                >
                  <MenuItem value="meeting">meeting</MenuItem>
                  <MenuItem value="client">client</MenuItem>
                  <MenuItem value="operations">operations</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Description"
                  value={eventDraft.description}
                  onChange={(event) => setEventDraft((current) => ({ ...current, description: event.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Début"
                  InputLabelProps={{ shrink: true }}
                  value={eventDraft.starts_at}
                  onChange={(event) => setEventDraft((current) => ({ ...current, starts_at: event.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Fin"
                  InputLabelProps={{ shrink: true }}
                  value={eventDraft.ends_at}
                  onChange={(event) => setEventDraft((current) => ({ ...current, ends_at: event.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Assigné à"
                  value={eventDraft.assigned_user_id === null ? '' : String(eventDraft.assigned_user_id)}
                  onChange={(event) =>
                    setEventDraft((current) => ({
                      ...current,
                      assigned_user_id: event.target.value === '' ? null : Number(event.target.value),
                    }))
                  }
                >
                  <MenuItem value="">Non assigné</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={String(user.id)}>
                      {(user.full_name ?? user.email) + ' · ' + user.role}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Lieu ou contexte"
                  value={eventDraft.location}
                  onChange={(event) => setEventDraft((current) => ({ ...current, location: event.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Lien Zoom / Meet"
                  placeholder="https://..."
                  value={eventDraft.meeting_url}
                  onChange={(event) => setEventDraft((current) => ({ ...current, meeting_url: event.target.value }))}
                />
              </Grid>
            </Grid>
            {eventSubmitError ? <Alert severity="error" sx={{ mt: 2.5 }}>{eventSubmitError}</Alert> : null}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button onClick={() => setIsEventDialogOpen(false)}>Annuler</Button>
              <Button variant="contained" onClick={() => void handleCreateEvent()} disabled={isEventSubmitting}>
                {isEventSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={isMessageDialogOpen} onClose={() => setIsMessageDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nouveau message</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                label="Destinataire"
                value={messageDraft.recipient_user_id === 0 ? '' : String(messageDraft.recipient_user_id)}
                onChange={(event) =>
                  setMessageDraft((current) => ({
                    ...current,
                    recipient_user_id: Number(event.target.value),
                  }))
                }
              >
                {messageContacts.map((contact) => (
                  <MenuItem key={contact.id} value={String(contact.id)}>
                    {(contact.full_name ?? contact.email) + ' · ' + contact.role}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Titre"
                value={messageDraft.title}
                onChange={(event) => setMessageDraft((current) => ({ ...current, title: event.target.value }))}
              />
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Message"
                value={messageDraft.message}
                onChange={(event) => setMessageDraft((current) => ({ ...current, message: event.target.value }))}
              />
            </Stack>
            {messageSubmitError ? <Alert severity="error" sx={{ mt: 2.5 }}>{messageSubmitError}</Alert> : null}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button onClick={() => setIsMessageDialogOpen(false)}>Annuler</Button>
              <Button
                variant="contained"
                onClick={() => void handleSendMessage()}
                disabled={
                  isMessageSubmitting ||
                  messageDraft.recipient_user_id === 0 ||
                  messageDraft.message.trim() === ''
                }
              >
                {isMessageSubmitting ? 'Envoi...' : 'Envoyer'}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

type HeroMetricProps = {
  icon: ReactNode;
  value: string;
  label: string;
};

const HeroMetric = ({ icon, value, label }: HeroMetricProps) => {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}>{icon}</Avatar>
      <Box>
        <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>{value}</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.74)' }}>
          {label}
        </Typography>
      </Box>
    </Stack>
  );
};

type EventRowProps = {
  event: DashboardEvent;
};

const EventRow = ({ event }: EventRowProps) => {
  return (
    <Box
      sx={{
        p: 1.75,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        bgcolor: 'rgba(15, 23, 42, 0.03)',
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
          <Box>
            <Typography fontWeight={700}>{event.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {event.description ?? 'Événement planifié'}
            </Typography>
          </Box>
          <Chip label={formatDateTime(event.starts_at)} size="small" />
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip label={event.category} size="small" variant="outlined" />
          {event.assigned_user_name ? (
            <Chip label={'Assigné : ' + event.assigned_user_name} size="small" variant="outlined" />
          ) : null}
          {event.location ? <Chip label={event.location} size="small" variant="outlined" /> : null}
        </Stack>

        {event.meeting_url ? (
          <Link href={event.meeting_url} target="_blank" rel="noreferrer" underline="hover" sx={{ fontWeight: 700 }}>
            Ouvrir le lien de réunion
          </Link>
        ) : null}
      </Stack>
    </Box>
  );
};

type TaskCardProps = {
  task: DashboardTask;
};

const TaskCard = ({ task }: TaskCardProps) => {
  const priorityLabel = priorityLabelMap[task.priority] ?? task.priority;
  const priorityColor = priorityColorMap[task.priority] ?? 'rgba(15, 23, 42, 0.08)';

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        bgcolor: '#fff',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
          <Typography fontWeight={700}>{task.title}</Typography>
          <Chip label={priorityLabel} size="small" sx={{ bgcolor: priorityColor }} />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {task.description ?? 'Tache sans detail complementaire.'}
        </Typography>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {formatDateTime(task.due_at)}
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {task.progress}%
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={task.progress} sx={{ height: 8, borderRadius: 999 }} />
      </Stack>
    </Box>
  );
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatTimeAgo(value: string) {
  const target = new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.round((Date.now() - target) / 60000));

  if (diffMinutes < 60) {
    return String(diffMinutes) + ' min';
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return String(diffHours) + ' h';
  }

  return String(Math.round(diffHours / 24)) + ' j';
}

function toDateTimeLocalInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default DashboardPage;
