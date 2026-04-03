import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  createClientRequest,
  deleteClientRequest,
  fetchClientRequest,
  updateClientRequest,
} from '../api/clientsApi';
import ClientForm from '../components/ClientForm';
import type { Client, ClientPayload } from '../types/client.types';

const emptyClient: ClientPayload = {
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
};

const ClientDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ clientId?: string }>();
  const clientId = Number(params.clientId);
  const isCreate = location.pathname.endsWith('/new');
  const isEdit = location.pathname.endsWith('/edit');

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(!isCreate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isCreate || !Number.isFinite(clientId)) {
      setClient(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadClient = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const response = await fetchClientRequest(clientId);

        if (isMounted) {
          setClient(response);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Impossible de charger ce client.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadClient();

    return () => {
      isMounted = false;
    };
  }, [clientId, isCreate]);

  const initialValues = useMemo<ClientPayload>(() => {
    if (!client) {
      return emptyClient;
    }

    return {
      company_name: client.company_name,
      contact_name: client.contact_name ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
    };
  }, [client]);

  const handleSubmit = async (values: ClientPayload) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = isCreate
        ? await createClientRequest(values)
        : await updateClientRequest(clientId, values);

      navigate(`/app/clients/${response.id}`);
    } catch {
      setErrorMessage('Enregistrement impossible pour le moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!client) {
      return;
    }

    const confirmed = window.confirm(
      'Supprimer ce client ? Cette action est irréversible.',
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await deleteClientRequest(client.id);
      navigate('/app/clients');
    } catch {
      setErrorMessage(
        'Suppression impossible. Ce client a peut-être des devis associés.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isCreate || isEdit) {
    return (
      <Stack spacing={3}>
        <Button variant="text" onClick={() => navigate('/app/clients')} sx={{ width: 'fit-content' }}>
          Retour à la liste
        </Button>
        <ClientForm
          initialValues={initialValues}
          title={isCreate ? 'Nouveau client' : 'Modifier le client'}
          submitLabel={isCreate ? 'Créer le client' : 'Enregistrer les modifications'}
          isSubmitting={isSubmitting}
          submitError={errorMessage}
          onSubmit={handleSubmit}
        />
      </Stack>
    );
  }

  if (!client) {
    return <Alert severity="error">Client introuvable.</Alert>;
  }

  return (
    <Stack spacing={3}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Button variant="text" onClick={() => navigate('/app/clients')} sx={{ width: 'fit-content' }}>
        Retour à la liste
      </Button>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h2">{client.company_name}</Typography>
          <Typography color="text.secondary">
            Contact: {client.contact_name ?? 'Non renseigné'}
          </Typography>
          <Typography color="text.secondary">
            Email: {client.email ?? 'Non renseigné'}
          </Typography>
          <Typography color="text.secondary">
            Téléphone: {client.phone ?? 'Non renseigné'}
          </Typography>
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={() => navigate(`/app/clients/${client.id}/edit`)}>
          Modifier
        </Button>
        <Button
          variant="outlined"
          color="error"
          disabled={isSubmitting}
          onClick={handleDelete}
        >
          Supprimer
        </Button>
      </Stack>
    </Stack>
  );
};

export default ClientDetailsPage;
