import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { useAppSelector } from 'app/store/hooks';
import { ROLE_LABELS } from 'shared/auth/permissions';

import {
  createUserRequest,
  deleteUserRequest,
  fetchUsersRequest,
  updateUserRequest,
} from '../api/usersApi';
import UserForm from '../components/UserForm';
import type { AdminUser, AdminUserPayload } from '../types/user.types';

const emptyUser: AdminUserPayload = {
  email: '',
  full_name: '',
  password: '',
  role: 'viewer',
};

const UsersAdminPage = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await fetchUsersRequest();
      setUsers(response.items);
    } catch {
      setErrorMessage('Impossible de charger les utilisateurs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const initialValues = useMemo<AdminUserPayload>(() => {
    if (selectedUser === null) {
      return emptyUser;
    }

    return {
      email: selectedUser.email,
      full_name: selectedUser.full_name ?? '',
      password: '',
      role: selectedUser.role,
    };
  }, [selectedUser]);

  const handleCreate = async (values: AdminUserPayload) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await createUserRequest(values);
      setDialogMode(null);
      setSelectedUser(null);
      await loadUsers();
    } catch {
      setErrorMessage('Creation impossible. Verifie email et role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (values: AdminUserPayload) => {
    if (selectedUser === null) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await updateUserRequest(selectedUser.id, values);
      setDialogMode(null);
      setSelectedUser(null);
      await loadUsers();
    } catch {
      setErrorMessage('Modification impossible pour le moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    const confirmed = window.confirm('Supprimer utilisateur ' + user.email + ' ?');

    if (confirmed === false) {
      return;
    }

    try {
      setErrorMessage(null);
      await deleteUserRequest(user.id);
      await loadUsers();
    } catch {
      setErrorMessage('Suppression impossible pour le moment.');
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h2">Administration utilisateurs</Typography>
          <Typography color="text.secondary">
            {users.length} utilisateur{users.length > 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            setSelectedUser(null);
            setDialogMode('create');
          }}
        >
          Nouvel utilisateur
        </Button>
      </Stack>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name ?? 'Non renseigne'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={ROLE_LABELS[user.role]}
                      color={user.role === 'admin' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {user.permissions.map((permission) => (
                        <Chip key={permission} size="small" variant="outlined" label={permission} />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
                          setDialogMode('edit');
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={user.email === currentUser?.email}
                        onClick={() => void handleDelete(user)}
                      >
                        Supprimer
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={dialogMode !== null}
        onClose={() => {
          setDialogMode(null);
          setSelectedUser(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Creer un utilisateur' : 'Modifier utilisateur'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <UserForm
              title={dialogMode === 'create' ? 'Nouvel utilisateur' : 'Edition utilisateur'}
              submitLabel={dialogMode === 'create' ? 'Creer le compte' : 'Enregistrer'}
              initialValues={initialValues}
              submitError={errorMessage}
              isSubmitting={isSubmitting}
              isEdit={dialogMode === 'edit'}
              onSubmit={dialogMode === 'create' ? handleCreate : handleUpdate}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default UsersAdminPage;
