import { useEffect, useState } from 'react';
import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';

import { clientSchema } from '../schemas/clientSchema';
import type { ClientPayload } from '../types/client.types';

type ClientFormProps = {
  initialValues: ClientPayload;
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (values: ClientPayload) => Promise<void>;
};

const ClientForm = ({
  initialValues,
  title,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit,
}: ClientFormProps) => {
  const [values, setValues] = useState<ClientPayload>(initialValues);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange =
    (field: keyof ClientPayload) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = clientSchema.safeParse(values);

    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Formulaire invalide.');
      return;
    }

    setValidationError(null);
    await onSubmit(parsed.data);
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h3">{title}</Typography>

        {validationError ? <Alert severity="error">{validationError}</Alert> : null}
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}

        <TextField
          label="Entreprise"
          value={values.company_name}
          onChange={handleChange('company_name')}
          required
          fullWidth
        />
        <TextField
          label="Contact"
          value={values.contact_name}
          onChange={handleChange('contact_name')}
          fullWidth
        />
        <TextField
          label="Email"
          type="email"
          value={values.email}
          onChange={handleChange('email')}
          fullWidth
        />
        <TextField
          label="Telephone"
          value={values.phone}
          onChange={handleChange('phone')}
          fullWidth
        />

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : submitLabel}
        </Button>
      </Stack>
    </Paper>
  );
};

export default ClientForm;
