import { Typography, Stack } from '@mui/material';

const HomePage = () => {
  return (
    <Stack spacing={2}>
      <Typography variant="h1">Cartotrac</Typography>
      <Typography variant="body1">
        Solutions de prise de vue aérienne par drone pour inspection, démoussage et cartographie.
      </Typography>
    </Stack>
  );
};

export default HomePage;