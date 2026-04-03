import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

import Sidebar from './Sidebar';

const AppLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(210, 198, 182, 0.16), transparent 24%), linear-gradient(180deg, rgba(253, 250, 245, 0.92) 0%, rgba(241, 235, 227, 0.96) 100%)',
      }}
    >
      <Sidebar />
      <Box sx={{ flex: 1, py: { xs: 3, md: 4 } }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;
