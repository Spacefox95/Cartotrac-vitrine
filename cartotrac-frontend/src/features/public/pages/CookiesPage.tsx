import { Grid, Link, Paper, Stack, Typography } from '@mui/material';

const CookiesPage = () => {
  const storageItems = [
    {
      title: 'Jeton d’authentification',
      keyName: 'cartotrac.accessToken',
      storageType: 'localStorage',
      purpose: 'Maintenir la session de l’espace connecté entre deux rechargements de page.',
      duration: 'Jusqu’à déconnexion, expiration du jeton ou suppression manuelle.',
    },
    {
      title: 'Brouillon de demande cadastre',
      keyName: 'cartotrac.cadastre.quoteDraft',
      storageType: 'sessionStorage',
      purpose: 'Éviter la perte d’un brouillon de qualification parcellaire en cours.',
      duration: 'Pendant la session du navigateur.',
    },
  ];

  return (
    <Stack spacing={4}>
      <PageIntro
        title="Politique de cookies"
        description="Cette page documente les cookies et autres stockages locaux identifiés dans l’état actuel du projet. Elle distingue ce qui est strictement nécessaire au fonctionnement de ce qui exigerait un consentement préalable."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Cookies techniques</Typography>
              <Typography color="text.secondary">Les stockages strictement nécessaires à l’authentification ou à la conservation d’un brouillon local peuvent être utilisés sans bandeau de consentement spécifique.</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Mesure d’audience</Typography>
              <Typography color="text.secondary">Aucun outil de mesure d’audience, publicité ou traceur marketing n’a été identifié dans l’audit du frontend effectué dans ce dépôt.</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Gestion des choix</Typography>
              <Typography color="text.secondary">Si des traceurs non essentiels sont ajoutés plus tard, un outil devra permettre d’accepter, refuser et retirer son choix aussi facilement.</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Typography variant="h2">Traceurs et stockages identifiés</Typography>
          <Grid container spacing={2}>
            {storageItems.map((item) => (
              <Grid key={item.keyName} size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2.5, boxShadow: 'none', bgcolor: 'rgba(255,255,255,0.72)', height: '100%' }}>
                  <Stack spacing={0.75}>
                    <Typography variant="h5">{item.title}</Typography>
                    <Typography color="text.secondary">Nom technique : {item.keyName}</Typography>
                    <Typography color="text.secondary">Support : {item.storageType}</Typography>
                    <Typography color="text.secondary">Finalité : {item.purpose}</Typography>
                    <Typography color="text.secondary">Durée : {item.duration}</Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={1.5}>
          <Typography variant="h2">Consentement</Typography>
          <Typography color="text.secondary">
            Dans l’état actuel du projet, les éléments identifiés servent uniquement au fonctionnement du service ou à la conservation locale d’un brouillon.
          </Typography>
          <Typography color="text.secondary">
            Si un outil d’analyse, de personnalisation, de publicité ou d’intégration tiers déposant des traceurs non essentiels est ajouté, Cartotrac devra afficher
            un bandeau de consentement conforme avant tout dépôt.
          </Typography>
          <Typography color="text.secondary">
            La CNIL rappelle qu’un choix de refus doit rester aussi simple que l’acceptation. Voir
            {' '}
            <Link href="https://www.cnil.fr/fr/gestion-des-cookies" target="_blank" rel="noreferrer">
              Gestion de vos préférences sur les cookies
            </Link>
            .
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

export default CookiesPage;
