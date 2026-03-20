import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'app/store/hooks';

import { deleteClientRequest } from '../api/clientsApi';
import ClientTable from '../components/ClientTable';
import { fetchClients } from '../store/clientsSlice';

const ClientsListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, total, isLoading, errorMessage } = useAppSelector(
    (state) => state.clients,
  );
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void dispatch(fetchClients(search));
  }, [dispatch, search]);

  const handleDelete = async (clientId: number) => {
    const confirmed = window.confirm(
      'Supprimer ce client ? Cette action est irreversible.',
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setActionError(null);
      await deleteClientRequest(clientId);
      await dispatch(fetchClients(search)).unwrap();
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setActionError(
        message ||
          'Suppression impossible. Ce client a peut-etre des devis associes.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography variant="h2">Clients</Typography>
          <Typography color="text.secondary">
            {total} client{total > 1 ? 's' : ''} charge{total > 1 ? 's' : ''}
          </Typography>
        </Box>

        <Button variant="contained" onClick={() => navigate('/app/clients/new')}>
          Nouveau client
        </Button>
      </Stack>

      <TextField
        label="Rechercher un client"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Entreprise, contact ou email"
      />

      {isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {actionError ? <Alert severity="error">{actionError}</Alert> : null}

      {!isLoading && !errorMessage && items.length === 0 ? (
        <Alert severity="info">Aucun client pour le moment.</Alert>
      ) : null}

      {!isLoading && items.length > 0 ? (
        <ClientTable
          clients={items}
          onView={(clientId) => navigate(`/app/clients/${clientId}`)}
          onEdit={(clientId) => navigate(`/app/clients/${clientId}/edit`)}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      ) : null}
    </Stack>
  );
};

export default ClientsListPage;
