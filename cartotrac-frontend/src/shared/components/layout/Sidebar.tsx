import { Box, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Sidebar = () => {
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
        <Button component={RouterLink} to="/app/clients">
          Clients
        </Button>
        <Button component={RouterLink} to="/app/quotes">
          Devis
        </Button>
      </Stack>
    </Box>
  );
};

export default Sidebar;