import { Outlet, useLocation } from 'react-router-dom';
import { Box, Container } from '@mui/material';

import Header from './Header';
import Footer from './Footer';

const PublicLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background:
          'radial-gradient(circle at top left, rgba(210, 198, 182, 0.16), transparent 24%), linear-gradient(180deg, rgba(253, 250, 245, 0.95) 0%, rgba(241, 235, 227, 0.98) 100%)',
      }}
    >
      <Header />
      <Container
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: isLoginPage ? 'center' : 'stretch',
          py: isLoginPage ? { xs: 1, md: 1.5 } : { xs: 3, md: 5 },
        }}
      >
        <Outlet />
      </Container>
      <Footer compact={isLoginPage} />
    </Box>
  );
};

export default PublicLayout;
