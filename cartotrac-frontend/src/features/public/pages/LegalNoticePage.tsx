import { Grid, Paper, Stack, Typography } from '@mui/material';

const LegalNoticePage = () => {
  return (
    <Stack spacing={4}>
      <PageIntro
        title="Mentions légales"
        description="Cette page rassemble les informations d’identification et de publication disponibles pour le projet. Certains champs obligatoires restent volontairement signalés comme à compléter, car ils ne figurent pas encore dans le dépôt."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Éditeur du site</Typography>
              <Typography color="text.secondary">Cartotrac</Typography>
              <Typography color="text.secondary">Contact : contact@cartotrac.fr</Typography>
              <Typography color="text.secondary">Raison sociale, forme juridique, capital social, numéro SIREN/RCS et adresse du siège : à compléter avant mise en production publique.</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Hébergement et publication</Typography>
              <Typography color="text.secondary">Directeur de publication : à compléter.</Typography>
              <Typography color="text.secondary">Hébergeur : à compléter avec dénomination, adresse postale et contact.</Typography>
              <Typography color="text.secondary">Le contenu du site a pour objectif de présenter l’offre Cartotrac et d’ouvrir un premier contact.</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={1.5}>
          <Typography variant="h2">Propriété intellectuelle</Typography>
          <Typography color="text.secondary">
            Sauf mention contraire, les contenus, textes, interfaces, éléments graphiques et composants applicatifs présents sur ce site sont protégés par le droit
            de la propriété intellectuelle. Toute reproduction, extraction ou réutilisation significative sans autorisation préalable peut être interdite.
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={1.5}>
          <Typography variant="h2">État de la page</Typography>
          <Typography color="text.secondary">
            Cette page n’est pas totalement finalisée juridiquement tant que les informations sociétaires, d’hébergement et de direction de publication n’ont pas été
            renseignées. Le projet ne doit donc pas être présenté comme intégralement conforme sur ce point avant complétion de ces données.
          </Typography>
        </Stack>
      </Paper>
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
