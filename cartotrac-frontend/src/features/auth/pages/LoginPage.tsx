import { Box, Paper, Typography } from '@mui/material';

import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h2" sx={{ mb: 3 }}>
          Connexion
        </Typography>
        <LoginForm />
      </Paper>
    </Box>
  );
};

export default LoginPage;