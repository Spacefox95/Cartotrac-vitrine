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
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { fetchClientsRequest } from 'features/clients/api/clientsApi';
import type { Client } from 'features/clients/types/client.types';
import {
  clearCadastreQuoteDraft,
  loadCadastreQuoteDraft,
  type CadastreQuoteDraft,
} from 'features/cadastre/utils/cadastreQuoteDraft';

import {
  createQuoteRequest,
  deleteQuoteRequest,
  downloadQuotePdfRequest,
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
  const [searchParams] = useSearchParams();
  const params = useParams<{ quoteId?: string }>();
  const quoteId = Number(params.quoteId);
  const isCreate = location.pathname.endsWith('/new');
  const isEdit = location.pathname.endsWith('/edit');
  const shouldApplyCadastreDraft = searchParams.get('cadastre') === '1';

  const [quote, setQuote] = useState<Quote | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cadastreDraft, setCadastreDraft] = useState<CadastreQuoteDraft | null>(null);

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
        setCadastreDraft(isCreate || shouldApplyCadastreDraft ? loadCadastreQuoteDraft() : null);
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
  }, [isCreate, quoteId, shouldApplyCadastreDraft]);

  const initialValues = useMemo<QuotePayload>(() => {
    if (!quote) {
      return {
        ...emptyQuote,
        client_id: clients[0]?.id ?? 0,
        cadastre_context: cadastreDraft,
      };
    }

    return {
      reference: quote.reference,
      client_id: quote.client_id,
      status: quote.status,
      total_ht: quote.total_ht,
      total_ttc: quote.total_ttc,
      cadastre_context: cadastreDraft ?? quote.cadastre_context ?? null,
    };
  }, [cadastreDraft, clients, quote]);

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

      if (isCreate || cadastreDraft) {
        clearCadastreQuoteDraft();
        setCadastreDraft(null);
      }

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

  const handleDownloadPdf = async () => {
    if (!quote) {
      return;
    }

    try {
      setIsDownloadingPdf(true);
      setErrorMessage(null);
      const { blob, filename } = await downloadQuotePdfRequest(quote.id);
      const objectUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');

      link.href = objectUrl;
      link.download = filename;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      setErrorMessage('Telechargement du PDF impossible pour le moment.');
    } finally {
      setIsDownloadingPdf(false);
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
        {isCreate && cadastreDraft ? (
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ xs: 'stretch', md: 'flex-start' }}>
                {cadastreDraft.preview_svg ? (
                  <Box
                    component="img"
                    src={cadastreDraft.preview_svg}
                    alt="Apercu du trace cadastre"
                    sx={{
                      width: { xs: '100%', md: 260 },
                      maxWidth: 320,
                      borderRadius: 3,
                      border: '1px solid rgba(15, 23, 42, 0.08)',
                      backgroundColor: '#f8fafc',
                    }}
                  />
                ) : null}
                <Stack spacing={1.25} sx={{ flex: 1 }}>
                  <Typography variant="h4">Trace cadastre enregistre</Typography>
                  {cadastreDraft.trace_area_sqm !== null ? (
                    <Alert severity="success">
                      Surface retenue pour le chiffrage: {new Intl.NumberFormat('fr-FR', {
                        maximumFractionDigits: cadastreDraft.trace_area_sqm >= 1000 ? 0 : 1,
                      }).format(cadastreDraft.trace_area_sqm)} m2
                    </Alert>
                  ) : null}
                  <Typography color="text.secondary">
                    {cadastreDraft.address_label ?? 'Point manuel'}
                  </Typography>
                  {cadastreDraft.parcel_title ? (
                    <Typography color="text.secondary">
                      Parcelle: {cadastreDraft.parcel_title}
                      {cadastreDraft.parcel_subtitle ? ` · ${cadastreDraft.parcel_subtitle}` : ''}
                    </Typography>
                  ) : null}
                  {cadastreDraft.parcel_area_label ? (
                    <Typography color="text.secondary">
                      Surface cadastrale indicative: {cadastreDraft.parcel_area_label}
                    </Typography>
                  ) : null}
                  <Typography color="text.secondary">
                    Trace enregistre le {new Intl.DateTimeFormat('fr-FR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(new Date(cadastreDraft.saved_at))}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button variant="outlined" onClick={() => navigate('/app/cadastre')}>
                      Revenir au cadastre
                    </Button>
                    <Button
                      variant="text"
                      color="inherit"
                      onClick={() => {
                        clearCadastreQuoteDraft();
                        setCadastreDraft(null);
                      }}
                    >
                      Retirer ce contexte
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        ) : null}
        {isEdit && cadastreDraft ? (
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ xs: 'stretch', md: 'flex-start' }}>
                {cadastreDraft.preview_svg ? (
                  <Box
                    component="img"
                    src={cadastreDraft.preview_svg}
                    alt="Apercu du trace cadastre"
                    sx={{
                      width: { xs: '100%', md: 260 },
                      maxWidth: 320,
                      borderRadius: 3,
                      border: '1px solid rgba(15, 23, 42, 0.08)',
                      backgroundColor: '#f8fafc',
                    }}
                  />
                ) : null}
                <Stack spacing={1.25} sx={{ flex: 1 }}>
                  <Typography variant="h4">Nouveau trace cadastre pret a etre applique</Typography>
                  {cadastreDraft.trace_area_sqm !== null ? (
                    <Alert severity="success">
                      Surface retenue pour la mise a jour: {new Intl.NumberFormat('fr-FR', {
                        maximumFractionDigits: cadastreDraft.trace_area_sqm >= 1000 ? 0 : 1,
                      }).format(cadastreDraft.trace_area_sqm)} m2
                    </Alert>
                  ) : null}
                  <Typography color="text.secondary">
                    L&apos;enregistrement du devis remplacera le contexte cadastre actuel.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button variant="outlined" onClick={() => navigate(`/app/cadastre?quoteId=${quoteId}`)}>
                      Revenir au cadastre
                    </Button>
                    <Button
                      variant="text"
                      color="inherit"
                      onClick={() => {
                        clearCadastreQuoteDraft();
                        setCadastreDraft(null);
                      }}
                    >
                      Conserver le contexte actuel
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        ) : null}
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

      {quote.cadastre_context ? (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Typography variant="h4">Contexte cadastre du devis</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ xs: 'stretch', md: 'flex-start' }}>
              {quote.cadastre_context.preview_svg ? (
                <Box
                  component="img"
                  src={quote.cadastre_context.preview_svg}
                  alt="Apercu du trace associe au devis"
                  sx={{
                    width: { xs: '100%', md: 260 },
                    maxWidth: 320,
                    borderRadius: 3,
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    backgroundColor: '#f8fafc',
                  }}
                />
              ) : null}
              <Stack spacing={1.25} sx={{ flex: 1 }}>
                {quote.cadastre_context.trace_area_sqm !== undefined && quote.cadastre_context.trace_area_sqm !== null ? (
                  <Alert severity="success">
                    Surface retenue: {new Intl.NumberFormat('fr-FR', {
                      maximumFractionDigits: quote.cadastre_context.trace_area_sqm >= 1000 ? 0 : 1,
                    }).format(quote.cadastre_context.trace_area_sqm)} m2
                  </Alert>
                ) : null}
                {quote.cadastre_context.address_label ? (
                  <Typography color="text.secondary">{quote.cadastre_context.address_label}</Typography>
                ) : null}
                {quote.cadastre_context.parcel_title ? (
                  <Typography color="text.secondary">
                    Parcelle: {quote.cadastre_context.parcel_title}
                    {quote.cadastre_context.parcel_subtitle ? ` · ${quote.cadastre_context.parcel_subtitle}` : ''}
                  </Typography>
                ) : null}
                {quote.cadastre_context.parcel_area_label ? (
                  <Typography color="text.secondary">
                    Surface cadastrale indicative: {quote.cadastre_context.parcel_area_label}
                  </Typography>
                ) : null}
                {quote.cadastre_context.saved_at ? (
                  <Typography color="text.secondary">
                    Trace enregistre le {new Intl.DateTimeFormat('fr-FR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(new Date(quote.cadastre_context.saved_at))}
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={() => navigate(`/app/quotes/${quote.id}/edit`)}>
          Modifier
        </Button>
        <Button
          variant="outlined"
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
        >
          {isDownloadingPdf ? 'Generation du PDF...' : 'Telecharger le PDF'}
        </Button>
        <Button variant="outlined" onClick={() => navigate(`/app/cadastre?quoteId=${quote.id}`)}>
          Mettre a jour le cadastre
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
