import { Architecture, AutoAwesome, PinDrop, Timeline } from '@mui/icons-material';
import { Grid, Paper, Stack, Typography } from '@mui/material';

import HeroSection from 'features/public/components/HeroSection';

const values = [
  {
    title: 'Clarté avant surenchère',
    description: 'Nous privilégions les flux lisibles, les décisions explicables et les écrans utiles au quotidien.',
    icon: AutoAwesome,
  },
  {
    title: 'Terrain avant abstraction',
    description: 'Le logiciel doit aider à comprendre un lieu réel, pas seulement à remplir des champs.',
    icon: PinDrop,
  },
  {
    title: 'Progression structurée',
    description: 'On pose une base cohérente puis on l’enrichit par couches, sans perdre les acquis.',
    icon: Timeline,
  },
];

const roadmap = [
  'Site vitrine clair et cohérent avec l’outil métier',
  'Intranet sécurisé pour les équipes et les rôles',
  'Gestion clients et devis reliés au contexte terrain',
  'Cadastre et mesure préparatoire déjà actifs',
  'Extensions futures : missions, drones, comptabilité, 3D',
];

const AboutPage = () => {
  return (
    <Stack spacing={4.5}>
      <HeroSection
        eyebrow="À propos"
        title="Cartotrac naît d’un besoin simple : mieux relier lecture du terrain et préparation commerciale."
        description="Le projet part d’un constat très concret. Dans beaucoup d’activités terrain, on jongle entre site vitrine, messages entrants, cartes, captures d’écran, fichiers temporaires et devis. Cartotrac vise à remettre de l’ordre dans cette chaîne en créant un socle plus continu entre compréhension d’un lieu, qualification du besoin et réponse commerciale."
        primaryCta={{ label: 'Voir les services', to: '/services' }}
        secondaryCta={{ label: 'Prendre contact', to: '/contact' }}
        highlights={['Produit utile', 'Approche incrémentale', 'Vision métier']}
        cards={[
          {
            title: 'Un socle réel',
            description: 'Le projet ne se contente pas d’une promesse vitrine : clients, devis et cadastre existent déjà dans l’application.',
          },
          {
            title: 'Une logique métier',
            description: 'Chaque brique cherche à faire gagner du temps sur le chemin entre un lieu à comprendre et une action à engager.',
          },
          {
            title: 'Une trajectoire assumée',
            description: 'La plateforme est pensée pour accueillir d’autres modules sans perdre en lisibilité.',
          },
        ]}
      />

      <Grid container spacing={2.5}>
        {values.map(({ title, description, icon: Icon }) => (
          <Grid key={title} size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Stack spacing={1.5}>
                <Icon sx={{ color: 'primary.main' }} />
                <Typography variant="h4">{title}</Typography>
                <Typography color="text.secondary">{description}</Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={1.25}>
              <Architecture sx={{ color: 'primary.main' }} />
              <Typography variant="h2">Une construction par étapes</Typography>
              <Typography color="text.secondary">
                Cartotrac avance comme un atelier bien posé : on solidifie d’abord la structure utile, puis on ouvre les extensions là où elles apportent un vrai retour terrain ou commercial.
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={1.25}>
              {roadmap.map((item, index) => (
                <Paper key={item} sx={{ p: 2.25, boxShadow: 'none', bgcolor: 'rgba(255,255,255,0.72)' }}>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <Typography variant="h5" color="primary.main">0{index + 1}</Typography>
                    <Typography color="text.secondary">{item}</Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
};

export default AboutPage;
