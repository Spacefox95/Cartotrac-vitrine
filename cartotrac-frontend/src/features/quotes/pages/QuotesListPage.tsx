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

import { deleteQuoteRequest } from '../api/quotesApi';
import QuoteTable from '../components/QuoteTable';
import { fetchQuotes } from '../store/quotesSlice';

const QuotesListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, total, isLoading, errorMessage } = useAppSelector(
    (state) => state.quotes,
  );
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void dispatch(fetchQuotes(search));
  }, [dispatch, search]);

  const handleDelete = async (quoteId: number) => {
    const confirmed = window.confirm(
      'Supprimer ce devis ? Cette action est irréversible.',
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setActionError(null);
      await deleteQuoteRequest(quoteId);
      await dispatch(fetchQuotes(search)).unwrap();
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setActionError(message || 'Suppression impossible pour le moment.');
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
          <Typography variant="h2">Devis</Typography>
          <Typography color="text.secondary">
            {total} devis charge{total > 1 ? 's' : ''}
          </Typography>
        </Box>

        <Button variant="contained" onClick={() => navigate('/app/quotes/new')}>
          Nouveau devis
        </Button>
      </Stack>

      <TextField
        label="Rechercher un devis"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Reference"
      />

      {isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {actionError ? <Alert severity="error">{actionError}</Alert> : null}

      {!isLoading && !errorMessage && items.length === 0 ? (
        <Alert severity="info">Aucun devis pour le moment.</Alert>
      ) : null}

      {!isLoading && items.length > 0 ? (
        <QuoteTable
          quotes={items}
          onView={(quoteId) => navigate(`/app/quotes/${quoteId}`)}
          onEdit={(quoteId) => navigate(`/app/quotes/${quoteId}/edit`)}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      ) : null}
    </Stack>
  );
};

export default QuotesListPage;
