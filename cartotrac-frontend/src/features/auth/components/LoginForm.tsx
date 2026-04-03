import { useState } from 'react';
import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';

import { useAppDispatch } from 'app/store/hooks';

import { loginRequest } from '../api/auth.api';
import { loginSuccess, logout } from '../store/authSlice';

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setErrorMessage('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await loginRequest({ email, password });
      dispatch(loginSuccess(response.access_token));
      navigate('/app/dashboard');
    } catch {
      dispatch(logout());
      setErrorMessage('Connexion impossible. Vérifiez vos identifiants ou le backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        fullWidth
      />
      <TextField
        label="Mot de passe"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        fullWidth
      />
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {isSubmitting ? 'Connexion...' : 'Se connecter'}
      </Button>
      <Typography variant="body2" color="text.secondary">
        La connexion conserve un jeton technique dans votre navigateur pour maintenir la session. Plus d’informations dans la
        {' '}
        <Link component={RouterLink} to="/confidentialite" underline="hover">
          politique de confidentialité
        </Link>
        {' '}
        et la
        {' '}
        <Link component={RouterLink} to="/cookies" underline="hover">
          politique de cookies
        </Link>
        .
      </Typography>
    </Box>
  );
};

export default LoginForm;
