import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

import Header from './Header';
import Footer from './Footer';

const PublicLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(210, 198, 182, 0.16), transparent 24%), linear-gradient(180deg, rgba(253, 250, 245, 0.95) 0%, rgba(241, 235, 227, 0.98) 100%)',
      }}
    >
      <Header />
      <Container sx={{ py: { xs: 3, md: 5 } }}>
        <Outlet />
      </Container>
      <Footer />
    </Box>
  );
};

export default PublicLayout;
