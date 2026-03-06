import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

import Sidebar from './Sidebar';

const AppLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Container sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default AppLayout;