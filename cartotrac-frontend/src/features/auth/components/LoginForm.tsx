import { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'app/store/hooks';
import { loginSuccess } from '../store/authSlice';

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      return;
    }

    dispatch(loginSuccess('fake-token'));
    navigate('/app/dashboard');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
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
      <Button type="submit" variant="contained">
        Se connecter
      </Button>
    </Box>
  );
};

export default LoginForm;