import { Box, Grid, Paper, Stack, Typography } from '@mui/material';

type FooterStat = {
  value: string;
  label: string;
};

type FooterSectionProps = {
  title: string;
  description: string;
  stats: FooterStat[];
};

const FooterSection = ({ title, description, stats }: FooterSectionProps) => {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h2">{title}</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 780, mt: 1 }}>
            {description}
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {stats.map((item) => (
            <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
              <Paper
                sx={{
                  p: 2.5,
                  height: '100%',
                  bgcolor: 'rgba(255,255,255,0.72)',
                  boxShadow: 'none',
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="h3" color="primary.main">
                    {item.value}
                  </Typography>
                  <Typography color="text.secondary">{item.label}</Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Paper>
  );
};

export default FooterSection;
