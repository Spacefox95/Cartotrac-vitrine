import { Grid, Paper, Stack, Typography } from '@mui/material';

const CookiesPage = () => {
  return (
    <Stack spacing={4}>
      <PageIntro
        title="Politique de cookies"
        description="Cette page sert de base propre pour documenter l’usage des cookies sur le site vitrine. Les choix techniques définitifs pourront ensuite être détaillés avant mise en ligne publique."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Cookies techniques</Typography>
              <Typography color="text.secondary">Ils permettent au site de fonctionner correctement, notamment pour la navigation ou l’accès à certaines zones.</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Mesure d’audience</Typography>
              <Typography color="text.secondary">Si une solution d’analyse est ajoutée, cette section pourra détailler sa finalité et son paramétrage.</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Gestion des choix</Typography>
              <Typography color="text.secondary">Les modalités d’acceptation, de refus ou de retrait du consentement pourront être précisées ici avec l’outil retenu.</Typography>
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

export default CookiesPage;
