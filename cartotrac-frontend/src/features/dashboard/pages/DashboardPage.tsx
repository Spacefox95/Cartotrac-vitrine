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
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from 'app/store/hooks';
import { hasPermission } from 'shared/auth/permissions';

import { getDashboardRequest } from '../api/dashboard.api';
import { DashboardStatCard } from '../components/DashboardCards';
import type {
  DashboardEvent,
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

  const planningRoute = canManageDashboard ? '/app/admin/dashboard?tab=events' : '/app/dashboard';
  const alertsRoute = canManageDashboard ? '/app/admin/dashboard?tab=notifications' : '/app/dashboard';

  const quickActions = [
    {
      title: 'Nouveau devis',
      description: 'Creer directement une nouvelle proposition commerciale.',
      icon: <DescriptionOutlined fontSize="small" />,
      to: canWriteQuotes ? '/app/quotes/new' : '/app/quotes',
      helper: canWriteQuotes ? 'Ouvre la creation de devis.' : 'Ouvre la liste des devis.',
      disabled: false,
    },
    {
      title: 'Nouveau client',
      description: 'Ajouter un compte client et lancer sa fiche.',
      icon: <PeopleAltOutlined fontSize="small" />,
      to: canWriteClients ? '/app/clients/new' : '/app/clients',
      helper: canWriteClients ? 'Ouvre la creation de client.' : 'Ouvre la base clients.',
      disabled: false,
    },
    {
      title: 'Gerer planning',
      description: canManageDashboard
        ? 'Acceder a la gestion des evenements du dashboard.'
        : 'Consulter le planning courant du tableau de bord.',
      icon: <EventAvailable fontSize="small" />,
      to: planningRoute,
      helper: canManageDashboard ? "Ouvre l'onglet evenements." : "Reste sur le planning visible dans le dashboard.",
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

  const summary = dashboard.summary;
  const calendar = dashboard.calendar;
  const tasks = dashboard.tasks;
  const events = dashboard.events;
  const notifications = dashboard.notifications;
  const recentQuotes = dashboard.recent_quotes;
  const monthLabel = monthNames[calendar.month - 1] + ' ' + String(calendar.year);

  return (
    <Stack spacing={3.5}>
      <Paper
        elevation={0}
        sx={{
          overflow: 'hidden',
          borderRadius: 6,
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
                  Bonjour {firstName}, voici votre tour de controle Cartotrac.
                </Typography>
                <Typography sx={{ maxWidth: 620, color: 'rgba(255,255,255,0.8)', fontSize: '1.02rem' }}>
                  Vous avez {summary.today_events_total} rendez-vous planifies, {summary.open_tasks_total}{' '}
                  taches ouvertes et {summary.unread_notifications_total} notifications a surveiller.
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
                Flash operations
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
                  label="messages et alertes recents"
                />
                <HeroMetric
                  icon={<CalendarMonth />}
                  value={String(summary.today_events_total)}
                  label="evenements planifies aujourd'hui"
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
            subtitle="evenements programmes pour aujourd'hui"
            tone="teal"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <DashboardStatCard
            title="Notifications"
            value={String(summary.unread_notifications_total)}
            subtitle={String(notifications.length) + ' elements recents dans le flux interne'}
            tone="amber"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <DashboardStatCard
            title="Portefeuille clients"
            value={String(summary.clients_total)}
            subtitle={String(summary.sent_quotes_total) + ' devis envoyes et suivis commerciaux'}
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
              borderRadius: 5,
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
                <Chip icon={<CalendarMonth />} label={String(events.length) + ' a venir'} variant="outlined" />
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

                  return (
                    <Grid key={day === null ? 'empty-' + String(index) : day} size={1}>
                      <Box
                        sx={{
                          aspectRatio: '1 / 1',
                          borderRadius: 3,
                          display: 'grid',
                          placeItems: 'center',
                          border: day ? '1px solid rgba(15, 23, 42, 0.08)' : '1px dashed transparent',
                          bgcolor: isToday ? '#1565c0' : hasEvent ? 'rgba(21, 101, 192, 0.08)' : 'transparent',
                          color: isToday ? '#fff' : 'text.primary',
                          fontWeight: isToday ? 800 : 600,
                        }}
                      >
                        {day ?? ''}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              <Stack spacing={1.25}>
                {events.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, xl: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 5,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              height: '100%',
            }}
          >
            <Stack spacing={2.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5">Taches a faire</Typography>
                  <Typography color="text.secondary">Priorites synchronisees depuis l'API</Typography>
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
                borderRadius: 5,
                border: '1px solid rgba(15, 23, 42, 0.08)',
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h5">Messagerie</Typography>
                    <Typography color="text.secondary">Flux notifications en direct</Typography>
                  </Box>
                  <Chip label={String(summary.unread_notifications_total) + ' non lues'} color="primary" variant="outlined" />
                </Stack>

                <List disablePadding>
                  {notifications.map((notification, index) => (
                    <Box key={notification.id}>
                      <ListItem disableGutters sx={{ py: 1.25, alignItems: 'flex-start' }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getNotificationColor(notification.category) }}>
                            {notification.sender.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={notification.sender}
                          secondary={notification.title + ' · ' + notification.message}
                          slotProps={{
                            primary: { fontWeight: 700 },
                            secondary: { sx: { color: 'text.secondary', mt: 0.25 } },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(notification.created_at)}
                        </Typography>
                      </ListItem>
                      {index < notifications.length - 1 ? <Divider /> : null}
                    </Box>
                  ))}
                </List>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 5,
                border: '1px solid rgba(15, 23, 42, 0.08)',
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h5">Devis recents</Typography>
                <Stack spacing={1.25}>
                  {recentQuotes.map((quote) => (
                    <Box
                      key={quote.id}
                      sx={{
                        p: 1.75,
                        borderRadius: 3,
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
                borderRadius: 5,
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
                          borderRadius: 4,
                          textAlign: 'left',
                        }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            height: '100%',
                            borderRadius: 4,
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
        p: 1.5,
        borderRadius: 3,
        bgcolor: 'rgba(15, 23, 42, 0.03)',
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography fontWeight={700}>{event.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {event.description ?? 'Evenement planifie'}
          </Typography>
        </Box>
        <Chip label={formatDateTime(event.starts_at)} size="small" />
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
        borderRadius: 4,
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

function getNotificationColor(category: DashboardNotification['category']) {
  if (category === 'alert') {
    return '#ef6c00';
  }

  if (category === 'message') {
    return '#1565c0';
  }

  return '#00897b';
}

export default DashboardPage;
