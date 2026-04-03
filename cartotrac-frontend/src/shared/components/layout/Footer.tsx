import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const footerLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'À propos', to: '/a-propos' },
  { label: 'Demande de devis', to: '/demande-devis' },
  { label: 'Contact', to: '/contact' },
];

const legalLinks = [
  { label: 'Mentions légales', to: '/mentions-legales' },
  { label: 'Confidentialité', to: '/confidentialite' },
  { label: 'Cookies', to: '/cookies' },
  { label: 'Connexion', to: '/login' },
];

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        py: { xs: 4, md: 5 },
        borderTop: '1px solid rgba(85, 96, 111, 0.08)',
        background: 'rgba(253, 250, 245, 0.72)',
      }}
    >
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 3, md: 4 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={1.25}>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                Cartotrac
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
                Une vitrine claire et un socle métier utile pour relier lecture du terrain, qualification d’une adresse et préparation commerciale.
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="h5" color="primary.main">
                Navigation
              </Typography>
              {footerLinks.map((item) => (
                <Button
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  color="inherit"
                  sx={{ justifyContent: 'flex-start', px: 0, color: 'text.secondary' }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Stack spacing={0.5}>
              <Typography variant="h5" color="primary.main">
                Informations
              </Typography>
              {legalLinks.map((item) => (
                <Button
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  color="inherit"
                  sx={{ justifyContent: 'flex-start', px: 0, color: 'text.secondary' }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          © Cartotrac • Site vitrine et plateforme de repérage commercial et cartographique.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
