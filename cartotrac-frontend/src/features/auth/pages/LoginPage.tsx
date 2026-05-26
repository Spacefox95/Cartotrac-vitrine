import { Box, Paper, Typography } from '@mui/material';

import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        py: { xs: 0.5, md: 1 },
      }}
    >
      <Paper sx={{ p: { xs: 2.5, md: 3 }, width: '100%', maxWidth: 380 }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          Connexion
        </Typography>
        <LoginForm />
      </Paper>
    </Box>
  );
};

export default LoginPage;
