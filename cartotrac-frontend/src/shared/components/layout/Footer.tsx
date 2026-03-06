import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ py: 3, textAlign: 'center' }}>
      <Typography variant="body2">
        © Cartotrac — Tous droits réservés
      </Typography>
    </Box>
  );
};

export default Footer;