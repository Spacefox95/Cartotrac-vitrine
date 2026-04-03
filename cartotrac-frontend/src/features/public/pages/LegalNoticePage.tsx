import { Grid, Paper, Stack, Typography } from '@mui/material';

const LegalNoticePage = () => {
  return (
    <Stack spacing={4}>
      <PageIntro
        title="Mentions légales"
        description="Cette page pose un cadre éditorial propre pour la publication du site vitrine. Les informations d’identification légales exactes pourront être complétées avant mise en production."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Éditeur du site</Typography>
              <Typography color="text.secondary">Cartotrac</Typography>
              <Typography color="text.secondary">Contact : contact@cartotrac.fr</Typography>
              <Typography color="text.secondary">Les coordonnées légales complètes de l’entreprise pourront être insérées ici.</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Hébergement et publication</Typography>
              <Typography color="text.secondary">Les informations d’hébergement, de directeur de publication et de contact juridique pourront être précisées avant publication publique.</Typography>
              <Typography color="text.secondary">Le contenu du site a pour objectif de présenter l’offre Cartotrac et d’ouvrir un premier contact.</Typography>
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

export default LegalNoticePage;
