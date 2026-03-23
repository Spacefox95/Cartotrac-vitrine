import { Box, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { useAppSelector } from 'app/store/hooks';
import { hasPermission } from 'shared/auth/permissions';

const Sidebar = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const canManage = hasPermission(currentUser?.permissions, 'users:manage');

  return (
    <Box
      sx={{
        width: 240,
        p: 2,
        borderRight: '1px solid #e0e0e0',
        backgroundColor: '#fff',
      }}
    >
      <Stack spacing={2}>
        <Button component={RouterLink} to="/app/dashboard">
          Dashboard
        </Button>
        <Button component={RouterLink} to="/app/cadastre">
          Cadastre
        </Button>
        <Button component={RouterLink} to="/app/clients">
          Clients
        </Button>
        <Button component={RouterLink} to="/app/quotes">
          Devis
        </Button>
        {canManage ? (
          <Button component={RouterLink} to="/app/admin/users">
            Utilisateurs
          </Button>
        ) : null}
        {canManage ? (
          <Button component={RouterLink} to="/app/admin/dashboard">
            Contenu dashboard
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
};

export default Sidebar;
