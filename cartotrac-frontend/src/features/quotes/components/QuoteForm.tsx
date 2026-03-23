import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type { Client } from 'features/clients/types/client.types';

import { quoteSchema } from '../schemas/quoteSchema';
import type { QuotePayload } from '../types/quote.types';

type QuoteFormProps = {
  clients: Client[];
  initialValues: QuotePayload;
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (values: QuotePayload) => Promise<void>;
};

const statusOptions = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'sent', label: 'Envoye' },
  { value: 'accepted', label: 'Accepte' },
  { value: 'rejected', label: 'Refuse' },
];

const QuoteForm = ({
  clients,
  initialValues,
  title,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit,
}: QuoteFormProps) => {
  const [values, setValues] = useState<QuotePayload>(initialValues);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange =
    (field: keyof QuotePayload) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = quoteSchema.safeParse(values);

    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Formulaire invalide.');
      return;
    }

    setValidationError(null);
    await onSubmit({
      ...parsed.data,
      client_id: Number(parsed.data.client_id),
      cadastre_context: values.cadastre_context ?? null,
    });
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h3">{title}</Typography>

        {validationError ? <Alert severity="error">{validationError}</Alert> : null}
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}

        <TextField
          label="Reference"
          value={values.reference}
          onChange={handleChange('reference')}
          required
          fullWidth
        />

        <TextField
          select
          label="Client"
          value={String(values.client_id)}
          onChange={handleChange('client_id')}
          required
          fullWidth
        >
          {clients.map((client) => (
            <MenuItem key={client.id} value={String(client.id)}>
              {client.company_name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Statut"
          value={values.status}
          onChange={handleChange('status')}
          fullWidth
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Total HT"
          value={values.total_ht}
          onChange={handleChange('total_ht')}
          inputMode="decimal"
          fullWidth
        />

        <TextField
          label="Total TTC"
          value={values.total_ttc}
          onChange={handleChange('total_ttc')}
          inputMode="decimal"
          fullWidth
        />

        <Button type="submit" variant="contained" disabled={isSubmitting || clients.length === 0}>
          {isSubmitting ? 'Enregistrement...' : submitLabel}
        </Button>
      </Stack>
    </Paper>
  );
};

export default QuoteForm;
