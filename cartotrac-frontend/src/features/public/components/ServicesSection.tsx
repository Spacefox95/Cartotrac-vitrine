import { ArrowOutward, Insights, LocationOn, Map, RequestQuote } from '@mui/icons-material';
import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

type ServiceItem = {
  title: string;
  description: string;
  detail: string;
};

type ServicesSectionProps = {
  title: string;
  description: string;
  items: ServiceItem[];
  ctaLabel?: string;
  ctaTo?: string;
};

const icons = [Map, LocationOn, RequestQuote, Insights];

const ServicesSection = ({ title, description, items, ctaLabel, ctaTo }: ServicesSectionProps) => {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        <Stack spacing={1.25}>
          <Typography variant="h2">{title}</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 780 }}>
            {description}
          </Typography>
        </Stack>
        <Grid container spacing={2.5}>
          {items.map((item, index) => {
            const Icon = icons[index % icons.length];
            return (
              <Grid key={item.title} size={{ xs: 12, md: 6 }}>
                <Paper
                  sx={{
                    p: 2.75,
                    height: '100%',
                    bgcolor: 'rgba(255,255,255,0.72)',
                    boxShadow: 'none',
                  }}
                >
                  <Stack spacing={1.25}>
                    <Icon sx={{ color: 'primary.main' }} />
                    <Typography variant="h4">{item.title}</Typography>
                    <Typography color="text.secondary">{item.description}</Typography>
                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      {item.detail}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
        {ctaLabel && ctaTo ? (
          <Button
            variant="contained"
            component={RouterLink}
            to={ctaTo}
            endIcon={<ArrowOutward />}
            sx={{ width: "fit-content" }}
          >
            {ctaLabel}
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
};

export default ServicesSection;
