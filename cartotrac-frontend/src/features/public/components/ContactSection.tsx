import { East, Email, Phone, Place } from '@mui/icons-material';
import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

type ContactSectionProps = {
  title: string;
  description: string;
};

const contactItems = [
  {
    icon: Email,
    label: 'Email',
    value: 'contact@cartotrac.fr',
  },
  {
    icon: Phone,
    label: 'Téléphone',
    value: '06 00 00 00 00',
  },
  {
    icon: Place,
    label: 'Zone',
    value: 'Tarn, Occitanie et interventions élargies selon mission',
  },
];

const ContactSection = ({ title, description }: ContactSectionProps) => {
  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        background:
          'linear-gradient(135deg, rgba(85, 96, 111, 0.06) 0%, rgba(253, 250, 245, 0.92) 100%)',
      }}
    >
      <Grid container spacing={3} alignItems="center">
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={1.25}>
            <Typography variant="h2">{title}</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
              {description}
            </Typography>
            <Stack spacing={1.25} sx={{ pt: 1 }}>
              {contactItems.map(({ icon: Icon, label, value }) => (
                <Stack key={label} direction="row" spacing={1.25} alignItems="flex-start">
                  <Icon sx={{ mt: '2px', color: 'primary.main' }} fontSize="small" />
                  <Typography color="text.secondary">
                    <Typography component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
                      {label} :
                    </Typography>{' '}
                    {value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2.75, bgcolor: 'rgba(255,255,255,0.82)' }}>
            <Stack spacing={1.5}>
              <Typography variant="h4">Premier échange conseillé</Typography>
              <Typography color="text.secondary">
                Partagez l'adresse, le type de besoin, vos contraintes terrain et le délai visé. Nous revenons avec un cadrage clair du prochain pas utile.
              </Typography>
              <Button
                variant="contained"
                component={RouterLink}
                to="/contact"
                endIcon={<East />}
                sx={{ width: 'fit-content' }}
              >
                Nous contacter
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ContactSection;
