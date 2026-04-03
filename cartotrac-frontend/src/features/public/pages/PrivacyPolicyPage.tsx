import { Grid, Paper, Stack, Typography } from '@mui/material';

const PrivacyPolicyPage = () => {
  return (
    <Stack spacing={4}>
      <PageIntro
        title="Politique de confidentialité"
        description="Cette page présente le cadre de traitement des données susceptibles d’être collectées via le site vitrine. Une version juridique finalisée pourra être complétée avant diffusion publique."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Données concernées</Typography>
              <Typography color="text.secondary">Coordonnées de contact, contenu des messages, informations liées au besoin exprimé.</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Finalité</Typography>
              <Typography color="text.secondary">Répondre aux demandes, qualifier un besoin, préparer un échange commercial ou opérationnel.</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Cadre à compléter</Typography>
              <Typography color="text.secondary">Responsable de traitement, base légale, durée de conservation et modalités d’exercice des droits pourront être précisés avant publication finale.</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

const PageIntro = ({ title, description }: { title: string; description: string }) => (
  <Paper sx={{ p: { xs: 3, md: 4 } }}>
    <Stack spacing={1.25}>
      <Typography variant="h1">{title}</Typography>
      <Typography color="text.secondary">{description}</Typography>
    </Stack>
  </Paper>
);

export default PrivacyPolicyPage;
