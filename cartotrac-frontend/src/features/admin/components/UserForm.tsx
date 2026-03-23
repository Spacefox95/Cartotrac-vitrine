import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { ROLE_LABELS, ROLE_PERMISSIONS, USER_ROLES } from 'shared/auth/permissions';

import type { AdminUserPayload } from '../types/user.types';

type UserFormProps = {
  title: string;
  submitLabel: string;
  initialValues: AdminUserPayload;
  submitError: string | null;
  isSubmitting: boolean;
  isEdit?: boolean;
  onSubmit: (values: AdminUserPayload) => Promise<void>;
};

const UserForm = ({
  title,
  submitLabel,
  initialValues,
  submitError,
  isSubmitting,
  isEdit = false,
  onSubmit,
}: UserFormProps) => {
  const [values, setValues] = useState(initialValues);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleTextChange =
    (field: 'email' | 'full_name' | 'password') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleRoleChange = (event: SelectChangeEvent<AdminUserPayload['role']>) => {
    setValues((current) => ({
      ...current,
      role: event.target.value as AdminUserPayload['role'],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (values.email.trim() === '') {
      setValidationError('Email requis.');
      return;
    }

    if (isEdit === false && values.password.trim() === '') {
      setValidationError('Mot de passe requis.');
      return;
    }

    setValidationError(null);
    await onSubmit(values);
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h3">{title}</Typography>
        {validationError ? <Alert severity="error">{validationError}</Alert> : null}
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}

        <TextField
          label="Email"
          type="email"
          value={values.email}
          onChange={handleTextChange('email')}
          required
          fullWidth
        />
        <TextField
          label="Nom complet"
          value={values.full_name}
          onChange={handleTextChange('full_name')}
          fullWidth
        />
        <TextField
          label={isEdit ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
          type="password"
          value={values.password}
          onChange={handleTextChange('password')}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="user-role-label">Role</InputLabel>
          <Select labelId="user-role-label" label="Role" value={values.role} onChange={handleRoleChange}>
            {USER_ROLES.map((role) => (
              <MenuItem key={role} value={role}>
                {ROLE_LABELS[role]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Alert severity="info">Permissions: {ROLE_PERMISSIONS[values.role].join(', ')}</Alert>

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : submitLabel}
        </Button>
      </Stack>
    </Paper>
  );
};

export default UserForm;
