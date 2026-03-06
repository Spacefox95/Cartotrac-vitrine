import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

import Header from './Header';
import Footer from './Footer';

const PublicLayout = () => {
  return (
    <Box>
      <Header />
      <Container sx={{ py: 4 }}>
        <Outlet />
      </Container>
      <Footer />
    </Box>
  );
};

export default PublicLayout;