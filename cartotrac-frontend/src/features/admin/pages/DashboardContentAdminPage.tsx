import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import {
  createDashboardEventRequest,
  createDashboardNotificationRequest,
  createDashboardTaskRequest,
  deleteDashboardEventRequest,
  deleteDashboardNotificationRequest,
  deleteDashboardTaskRequest,
  fetchDashboardEventsRequest,
  fetchDashboardNotificationsRequest,
  fetchDashboardTasksRequest,
  updateDashboardEventRequest,
  updateDashboardNotificationRequest,
  updateDashboardTaskRequest,
} from '../api/dashboardAdminApi';
import { fetchUsersRequest } from '../api/usersApi';
import type {
  AdminDashboardEvent,
  AdminDashboardEventPayload,
  AdminDashboardNotification,
  AdminDashboardNotificationPayload,
  AdminDashboardTask,
  AdminDashboardTaskPayload,
} from '../types/dashboardAdmin.types';
import type { AdminUser } from '../types/user.types';

type SectionKey = 'tasks' | 'events' | 'notifications';
type DialogMode = 'create' | 'edit';

const validSections: SectionKey[] = ['tasks', 'events', 'notifications'];

const emptyTask: AdminDashboardTaskPayload = {
  title: '',
  description: '',
  due_at: '',
  status: 'todo',
  priority: 'medium',
  progress: 0,
};

const emptyEvent: AdminDashboardEventPayload = {
  title: '',
  description: '',
  starts_at: '',
  ends_at: '',
  category: 'meeting',
  assigned_user_id: null,
  location: '',
  meeting_url: '',
};

const emptyNotification: AdminDashboardNotificationPayload = {
  sender: '',
  title: '',
  message: '',
  category: 'general',
  is_read: false,
};

const getSectionFromParam = (value: string | null): SectionKey => {
  if (value !== null && validSections.includes(value as SectionKey)) {
    return value as SectionKey;
  }

  return 'tasks';
};

const buildEventDraftFromDate = (date: Date): AdminDashboardEventPayload => {
  const normalizedDate = new Date(date);
  normalizedDate.setSeconds(0, 0);

  const endDate = new Date(normalizedDate);
  endDate.setMinutes(endDate.getMinutes() + 45);

  return {
    ...emptyEvent,
    starts_at: toDateTimeLocalInput(normalizedDate),
    ends_at: toDateTimeLocalInput(endDate),
  };
};

const DashboardContentAdminPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [section, setSection] = useState<SectionKey>(() => getSectionFromParam(searchParams.get('tab')));
  const [tasks, setTasks] = useState<AdminDashboardTask[]>([]);
  const [events, setEvents] = useState<AdminDashboardEvent[]>([]);
  const [notifications, setNotifications] = useState<AdminDashboardNotification[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>('create');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AdminDashboardTask | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AdminDashboardEvent | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<AdminDashboardNotification | null>(null);
  const [taskValues, setTaskValues] = useState<AdminDashboardTaskPayload>(emptyTask);
  const [eventValues, setEventValues] = useState<AdminDashboardEventPayload>(emptyEvent);
  const [notificationValues, setNotificationValues] = useState<AdminDashboardNotificationPayload>(emptyNotification);

  useEffect(() => {
    const nextSection = getSectionFromParam(searchParams.get('tab'));
    setSection((current) => (current === nextSection ? current : nextSection));
  }, [searchParams]);

  useEffect(() => {
    const shouldCreateEvent = searchParams.get('create') === 'event';
    const startsAt = searchParams.get('starts_at');

    if (shouldCreateEvent === false || startsAt === null || isDialogOpen) {
      return;
    }

    const parsedDate = new Date(startsAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return;
    }

    setSection('events');
    setDialogMode('create');
    setSelectedTask(null);
    setSelectedEvent(null);
    setSelectedNotification(null);
    setTaskValues(emptyTask);
    setNotificationValues(emptyNotification);
    setEventValues(buildEventDraftFromDate(parsedDate));
    setIsDialogOpen(true);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('create');
    nextParams.delete('starts_at');
    setSearchParams(nextParams, { replace: true });
  }, [isDialogOpen, searchParams, setSearchParams]);

  const updateSection = (nextSection: SectionKey) => {
    setSection(nextSection);
    setSearchParams({ tab: nextSection }, { replace: true });
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const [taskResponse, eventResponse, notificationResponse, usersResponse] = await Promise.all([
        fetchDashboardTasksRequest(),
        fetchDashboardEventsRequest(),
        fetchDashboardNotificationsRequest(),
        fetchUsersRequest(),
      ]);
      setTasks(taskResponse.items);
      setEvents(eventResponse.items);
      setNotifications(notificationResponse.items);
      setUsers(usersResponse.items);
    } catch {
      setErrorMessage('Impossible de charger le contenu du dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const currentCount = useMemo(() => {
    if (section === 'tasks') {
      return tasks.length;
    }
    if (section === 'events') {
      return events.length;
    }
    return notifications.length;
  }, [events.length, notifications.length, section, tasks.length]);

  const openCreateDialog = () => {
    setDialogMode('create');
    setSelectedTask(null);
    setSelectedEvent(null);
    setSelectedNotification(null);
    setTaskValues(emptyTask);
    setEventValues(emptyEvent);
    setNotificationValues(emptyNotification);
    setIsDialogOpen(true);
  };

  const openEditTaskDialog = (task: AdminDashboardTask) => {
    updateSection('tasks');
    setDialogMode('edit');
    setSelectedTask(task);
    setTaskValues({
      title: task.title,
      description: task.description ?? '',
      due_at: toDateTimeLocal(task.due_at),
      status: task.status,
      priority: task.priority,
      progress: task.progress,
    });
    setIsDialogOpen(true);
  };

  const openEditEventDialog = (event: AdminDashboardEvent) => {
    updateSection('events');
    setDialogMode('edit');
    setSelectedEvent(event);
    setEventValues({
      title: event.title,
      description: event.description ?? '',
      starts_at: toDateTimeLocal(event.starts_at),
      ends_at: event.ends_at ? toDateTimeLocal(event.ends_at) : '',
      category: event.category,
      assigned_user_id: event.assigned_user_id,
      location: event.location ?? '',
      meeting_url: event.meeting_url ?? '',
    });
    setIsDialogOpen(true);
  };

  const openEditNotificationDialog = (notification: AdminDashboardNotification) => {
    updateSection('notifications');
    setDialogMode('edit');
    setSelectedNotification(notification);
    setNotificationValues({
      sender: notification.sender,
      title: notification.title,
      message: notification.message,
      category: notification.category,
      is_read: notification.is_read,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      if (section === 'tasks') {
        const payload = {
          ...taskValues,
          due_at: new Date(taskValues.due_at).toISOString(),
        };
        if (dialogMode === 'create') {
          await createDashboardTaskRequest(payload);
        } else if (selectedTask !== null) {
          await updateDashboardTaskRequest(selectedTask.id, payload);
        }
      }

      if (section === 'events') {
        const payload = {
          ...eventValues,
          starts_at: new Date(eventValues.starts_at).toISOString(),
          ends_at: eventValues.ends_at ? new Date(eventValues.ends_at).toISOString() : '',
        };
        if (dialogMode === 'create') {
          await createDashboardEventRequest(payload);
        } else if (selectedEvent !== null) {
          await updateDashboardEventRequest(selectedEvent.id, payload);
        }
      }

      if (section === 'notifications') {
        if (dialogMode === 'create') {
          await createDashboardNotificationRequest(notificationValues);
        } else if (selectedNotification !== null) {
          await updateDashboardNotificationRequest(selectedNotification.id, notificationValues);
        }
      }

      closeDialog();
      await loadData();
    } catch {
      setErrorMessage('Enregistrement impossible pour le moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (resourceId: number) => {
    const confirmed = window.confirm('Supprimer cet element ?');
    if (confirmed === false) {
      return;
    }

    try {
      setErrorMessage(null);
      if (section === 'tasks') {
        await deleteDashboardTaskRequest(resourceId);
      }
      if (section === 'events') {
        await deleteDashboardEventRequest(resourceId);
      }
      if (section === 'notifications') {
        await deleteDashboardNotificationRequest(resourceId);
      }
      await loadData();
    } catch {
      setErrorMessage('Suppression impossible pour le moment.');
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h2">Contenu du dashboard</Typography>
          <Typography color="text.secondary">{currentCount} element(s) dans la section active</Typography>
        </Box>
        <Button variant="contained" onClick={openCreateDialog}>
          Nouvel element
        </Button>
      </Stack>

      <Paper variant="outlined">
        <Tabs value={section} onChange={(_event, value: SectionKey) => updateSection(value)}>
          <Tab label="Taches" value="tasks" />
          <Tab label="Evenements" value="events" />
          <Tab label="Notifications" value="notifications" />
        </Tabs>
      </Paper>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {isLoading ? (
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Typography>Chargement...</Typography>
        </Paper>
      ) : null}

      {isLoading === false && section === 'tasks' ? (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Echeance</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Priorite</TableCell>
                <TableCell>Progression</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{formatDateTime(task.due_at)}</TableCell>
                  <TableCell>{task.status}</TableCell>
                  <TableCell>{task.priority}</TableCell>
                  <TableCell>{task.progress}%</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => openEditTaskDialog(task)}>
                        Modifier
                      </Button>
                      <Button size="small" color="error" onClick={() => void handleDelete(task.id)}>
                        Supprimer
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      {isLoading === false && section === 'events' ? (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Debut</TableCell>
                <TableCell>Fin</TableCell>
                <TableCell>Categorie</TableCell>
                <TableCell>Assigne</TableCell>
                <TableCell>Visio / lieu</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} hover>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{formatDateTime(event.starts_at)}</TableCell>
                  <TableCell>{event.ends_at ? formatDateTime(event.ends_at) : '-'}</TableCell>
                  <TableCell>{event.category}</TableCell>
                  <TableCell>{event.assigned_user_name ?? '-'}</TableCell>
                  <TableCell>{event.meeting_url ?? event.location ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => openEditEventDialog(event)}>
                        Modifier
                      </Button>
                      <Button size="small" color="error" onClick={() => void handleDelete(event.id)}>
                        Supprimer
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      {isLoading === false && section === 'notifications' ? (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Expediteur</TableCell>
                <TableCell>Titre</TableCell>
                <TableCell>Categorie</TableCell>
                <TableCell>Etat</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id} hover>
                  <TableCell>{notification.sender}</TableCell>
                  <TableCell>{notification.title}</TableCell>
                  <TableCell>{notification.category}</TableCell>
                  <TableCell>{notification.is_read ? 'Lue' : 'Non lue'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => openEditNotificationDialog(notification)}>
                        Modifier
                      </Button>
                      <Button size="small" color="error" onClick={() => void handleDelete(notification.id)}>
                        Supprimer
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{dialogMode === 'create' ? 'Creer un element' : 'Modifier un element'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {section === 'tasks' ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Titre" value={taskValues.title} onChange={(event) => setTaskValues((current) => ({ ...current, title: event.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Echeance" type="datetime-local" InputLabelProps={{ shrink: true }} value={taskValues.due_at} onChange={(event) => setTaskValues((current) => ({ ...current, due_at: event.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth multiline minRows={3} label="Description" value={taskValues.description} onChange={(event) => setTaskValues((current) => ({ ...current, description: event.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField select fullWidth label="Statut" value={taskValues.status} onChange={(event) => setTaskValues((current) => ({ ...current, status: event.target.value }))}>
                    <MenuItem value="todo">todo</MenuItem>
                    <MenuItem value="in_progress">in_progress</MenuItem>
                    <MenuItem value="done">done</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField select fullWidth label="Priorite" value={taskValues.priority} onChange={(event) => setTaskValues((current) => ({ ...current, priority: event.target.value }))}>
                    <MenuItem value="high">high</MenuItem>
                    <MenuItem value="medium">medium</MenuItem>
                    <MenuItem value="low">low</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth label="Progression" type="number" value={taskValues.progress} onChange={(event) => setTaskValues((current) => ({ ...current, progress: Number(event.target.value) }))} />
                </Grid>
              </Grid>
            ) : null}

            {section === 'events' ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Titre" value={eventValues.title} onChange={(event) => setEventValues((current) => ({ ...current, title: event.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField select fullWidth label="Categorie" value={eventValues.category} onChange={(event) => setEventValues((current) => ({ ...current, category: event.target.value }))}>
                    <MenuItem value="meeting">meeting</MenuItem>
                    <MenuItem value="client">client</MenuItem>
                    <MenuItem value="operations">operations</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth multiline minRows={3} label="Description" value={eventValues.description} onChange={(event) => setEventValues((current) => ({ ...current, description: event.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Debut" type="datetime-local" InputLabelProps={{ shrink: true }} value={eventValues.starts_at} onChange={(event) => setEventValues((current) => ({ ...current, starts_at: event.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Fin" type="datetime-local" InputLabelProps={{ shrink: true }} value={eventValues.ends_at} onChange={(event) => setEventValues((current) => ({ ...current, ends_at: event.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Assigne a"
                    value={eventValues.assigned_user_id === null ? '' : String(eventValues.assigned_user_id)}
                    onChange={(event) =>
                      setEventValues((current) => ({
                        ...current,
                        assigned_user_id: event.target.value === '' ? null : Number(event.target.value),
                      }))
                    }
                  >
                    <MenuItem value="">Non assigne</MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={String(user.id)}>
                        {(user.full_name ?? user.email) + ' · ' + user.role}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Lieu ou contexte" value={eventValues.location} onChange={(event) => setEventValues((current) => ({ ...current, location: event.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Lien Zoom / Meet" placeholder="https://..." value={eventValues.meeting_url} onChange={(event) => setEventValues((current) => ({ ...current, meeting_url: event.target.value }))} />
                </Grid>
              </Grid>
            ) : null}

            {section === 'notifications' ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Expediteur" value={notificationValues.sender} onChange={(event) => setNotificationValues((current) => ({ ...current, sender: event.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Titre" value={notificationValues.title} onChange={(event) => setNotificationValues((current) => ({ ...current, title: event.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth multiline minRows={3} label="Message" value={notificationValues.message} onChange={(event) => setNotificationValues((current) => ({ ...current, message: event.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField select fullWidth label="Categorie" value={notificationValues.category} onChange={(event) => setNotificationValues((current) => ({ ...current, category: event.target.value }))}>
                    <MenuItem value="general">general</MenuItem>
                    <MenuItem value="message">message</MenuItem>
                    <MenuItem value="alert">alert</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel control={<Checkbox checked={notificationValues.is_read} onChange={(event) => setNotificationValues((current) => ({ ...current, is_read: event.target.checked }))} />} label="Notification lue" />
                </Grid>
              </Grid>
            ) : null}

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button onClick={closeDialog}>Annuler</Button>
              <Button variant="contained" onClick={() => void handleSubmit()} disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

function toDateTimeLocal(value: string) {
  return new Date(value).toISOString().slice(0, 16);
}

function toDateTimeLocalInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default DashboardContentAdminPage;
