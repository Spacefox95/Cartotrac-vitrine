import { Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Accueil', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'À propos', to: '/a-propos' },
  { label: 'Contact', to: '/contact' },
];

const Header = () => {
  const location = useLocation();

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(12px)',
        background: 'rgba(253, 250, 245, 0.86)',
        borderBottom: '1px solid rgba(85, 96, 111, 0.08)',
      }}
    >
      <Toolbar
        sx={{
          maxWidth: 1280,
          mx: 'auto',
          width: '100%',
          px: { xs: 2.5, md: 3.5 },
          py: 1.25,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h4" sx={{ color: 'primary.main' }}>
            Cartotrac
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Repérage cartographique et pilotage commercial.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', md: 'center' }}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Button
                  key={item.to}
                  color="inherit"
                  component={RouterLink}
                  to={item.to}
                  sx={{
                    color: active ? 'primary.main' : 'text.secondary',
                    bgcolor: active ? 'rgba(85, 96, 111, 0.08)' : 'transparent',
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" component={RouterLink} to="/login">
              Connexion
            </Button>
            <Button variant="contained" component={RouterLink} to="/demande-devis">
              Demande de devis
            </Button>
          </Stack>
        </Stack>
      </Toolbar>
    </Box>
  );
};

export default Header;
