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

import { fetchClientsRequest } from 'features/clients/api/clientsApi';
import type { Client } from 'features/clients/types/client.types';

import {
  createQuoteRequest,
  deleteQuoteRequest,
  fetchQuoteRequest,
  updateQuoteRequest,
} from '../api/quotesApi';
import QuoteForm from '../components/QuoteForm';
import type { Quote, QuotePayload } from '../types/quote.types';

const emptyQuote: QuotePayload = {
  reference: '',
  client_id: 0,
  status: 'draft',
  total_ht: '0',
  total_ttc: '0',
};

const formatCurrency = (value: string) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return value;
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const QuoteDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ quoteId?: string }>();
  const quoteId = Number(params.quoteId);
  const isCreate = location.pathname.endsWith('/new');
  const isEdit = location.pathname.endsWith('/edit');

  const [quote, setQuote] = useState<Quote | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const [clientsResponse, quoteResponse] = await Promise.all([
          fetchClientsRequest(),
          isCreate || !Number.isFinite(quoteId)
            ? Promise.resolve(null)
            : fetchQuoteRequest(quoteId),
        ]);

        if (!isMounted) {
          return;
        }

        setClients(clientsResponse.items);
        setQuote(quoteResponse);
      } catch {
        if (isMounted) {
          setErrorMessage('Impossible de charger ce devis.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPage();

    return () => {
      isMounted = false;
    };
  }, [isCreate, quoteId]);

  const initialValues = useMemo<QuotePayload>(() => {
    if (!quote) {
      return {
        ...emptyQuote,
        client_id: clients[0]?.id ?? 0,
      };
    }

    return {
      reference: quote.reference,
      client_id: quote.client_id,
      status: quote.status,
      total_ht: quote.total_ht,
      total_ttc: quote.total_ttc,
    };
  }, [clients, quote]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === quote?.client_id) ?? null,
    [clients, quote],
  );

  const handleSubmit = async (values: QuotePayload) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = isCreate
        ? await createQuoteRequest(values)
        : await updateQuoteRequest(quoteId, values);

      navigate(`/app/quotes/${response.id}`);
    } catch {
      setErrorMessage('Enregistrement impossible pour le moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!quote) {
      return;
    }

    const confirmed = window.confirm(
      'Supprimer ce devis ? Cette action est irreversible.',
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await deleteQuoteRequest(quote.id);
      navigate('/app/quotes');
    } catch {
      setErrorMessage('Suppression impossible pour le moment.');
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
        <Button variant="text" onClick={() => navigate('/app/quotes')} sx={{ width: 'fit-content' }}>
          Retour a la liste
        </Button>
        <QuoteForm
          clients={clients}
          initialValues={initialValues}
          title={isCreate ? 'Nouveau devis' : 'Modifier le devis'}
          submitLabel={isCreate ? 'Creer le devis' : 'Enregistrer les modifications'}
          isSubmitting={isSubmitting}
          submitError={errorMessage}
          onSubmit={handleSubmit}
        />
      </Stack>
    );
  }

  if (!quote) {
    return <Alert severity="error">Devis introuvable.</Alert>;
  }

  return (
    <Stack spacing={3}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Button variant="text" onClick={() => navigate('/app/quotes')} sx={{ width: 'fit-content' }}>
        Retour a la liste
      </Button>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h2">{quote.reference}</Typography>
          <Typography color="text.secondary">
            Client: {selectedClient?.company_name ?? `#${quote.client_id}`}
          </Typography>
          <Typography color="text.secondary">Statut: {quote.status}</Typography>
          <Typography color="text.secondary">
            Total HT: {formatCurrency(quote.total_ht)}
          </Typography>
          <Typography color="text.secondary">
            Total TTC: {formatCurrency(quote.total_ttc)}
          </Typography>
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={() => navigate(`/app/quotes/${quote.id}/edit`)}>
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

export default QuoteDetailsPage;
