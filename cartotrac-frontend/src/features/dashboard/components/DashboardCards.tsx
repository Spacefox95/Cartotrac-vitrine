import { ArrowOutward } from '@mui/icons-material';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

export type DashboardStatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  tone: 'primary' | 'teal' | 'amber' | 'rose';
  trend?: string;
};

const toneStyles = {
  primary: {
    accent: '#1565c0',
    soft: 'linear-gradient(135deg, rgba(21, 101, 192, 0.16), rgba(21, 101, 192, 0.02))',
  },
  teal: {
    accent: '#00897b',
    soft: 'linear-gradient(135deg, rgba(0, 137, 123, 0.18), rgba(0, 137, 123, 0.03))',
  },
  amber: {
    accent: '#ef6c00',
    soft: 'linear-gradient(135deg, rgba(239, 108, 0, 0.2), rgba(239, 108, 0, 0.04))',
  },
  rose: {
    accent: '#c62828',
    soft: 'linear-gradient(135deg, rgba(198, 40, 40, 0.18), rgba(198, 40, 40, 0.03))',
  },
} as const;

export const DashboardStatCard = ({
  title,
  value,
  subtitle,
  tone,
  trend,
}: DashboardStatCardProps) => {
  const colors = toneStyles[tone];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background: colors.soft,
        minHeight: 168,
      }}
    >
      <Stack spacing={2} height="100%" justifyContent="space-between">
        <Stack direction="row" justifyContent="space-between" spacing={1.5}>
          <Typography variant="overline" sx={{ letterSpacing: '0.12em', color: 'text.secondary' }}>
            {title}
          </Typography>
          {trend ? (
            <Chip
              label={trend}
              size="small"
              icon={<ArrowOutward sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#fff',
                color: colors.accent,
                fontWeight: 700,
                '& .MuiChip-icon': { color: colors.accent },
              }}
            />
          ) : null}
        </Stack>

        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '2rem', md: '2.35rem' }, mb: 0.5 }}>
            {value}
          </Typography>
          <Typography color="text.secondary">{subtitle}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
