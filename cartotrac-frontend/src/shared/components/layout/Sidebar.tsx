import { Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { logout } from 'features/auth/store/authSlice';
import { hasPermission } from 'shared/auth/permissions';

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const canManage = hasPermission(currentUser?.permissions, 'users:manage');

  const navItems = [
    { to: '/app/dashboard', label: 'Dashboard' },
    { to: '/app/cadastre', label: 'Cadastre' },
    { to: '/app/clients', label: 'Clients' },
    { to: '/app/quotes', label: 'Devis' },
    ...(canManage
      ? [
          { to: '/app/admin/users', label: 'Utilisateurs' },
          { to: '/app/admin/dashboard', label: 'Contenu dashboard' },
        ]
      : []),
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box
      sx={{
        width: { xs: 100, md: 272 },
        p: 2,
        borderRight: '1px solid rgba(85, 96, 111, 0.08)',
        background:
          'linear-gradient(180deg, rgba(253, 250, 245, 0.98) 0%, rgba(244, 238, 230, 0.98) 100%)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        minHeight: '100vh',
      }}
    >
      <Stack sx={{ minHeight: '100%' }} spacing={3}>
        <Box
          sx={{
            px: 1,
            py: 1.5,
            borderRadius: 1,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(241, 232, 220, 0.92))',
            border: '1px solid rgba(200, 181, 157, 0.18)',
          }}
        >
          <Typography variant="h4" sx={{ color: '#3f4956', margin: "5px" }}>
            Cartotrac
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ margin: '5px'}}>
            Géomatique commerciale, devis et pilotage terrain.
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');

            return (
              <Button
                key={item.to}
                component={RouterLink}
                to={item.to}
                variant={isActive ? 'contained' : 'text'}
                color={isActive ? 'primary' : 'inherit'}
                sx={{
                  justifyContent: 'flex-start',
                  px: { xs: 1.25, md: 1.75 },
                  minWidth: 0,
                  color: isActive ? 'primary.contrastText' : '#4f5965',
                  backgroundColor: isActive ? undefined : 'rgba(255, 255, 255, 0.46)',
                  border: isActive ? undefined : '1px solid rgba(85, 96, 111, 0.05)',
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>

        <Stack spacing={1.25} sx={{ pt: 1.5, width: '90%', paddingBottom: '10px', borderTop: '1px solid rgba(85, 96, 111, 0.08)', position: 'absolute', bottom: 0 }}>
          {currentUser ? (
            <Box sx={{ px: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {currentUser.full_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser.email}
              </Typography>
            </Box>
          ) : null}
          <Button variant="outlined" color="inherit" onClick={handleLogout} sx={{ justifyContent: 'flex-start' }}>
            Déconnexion
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Sidebar;
