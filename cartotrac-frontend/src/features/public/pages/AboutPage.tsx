import { Architecture, AutoAwesome, PinDrop, Timeline } from '@mui/icons-material';
import { Grid, Paper, Stack, Typography } from '@mui/material';

import HeroSection from 'features/public/components/HeroSection';

const values = [
  {
    title: 'Précision utile',
    description: 'Nous adaptons le niveau de détail aux décisions à prendre : inspecter, mesurer, chiffrer, suivre ou archiver.',
    icon: AutoAwesome,
  },
  {
    title: 'Terrain d’abord',
    description: 'Chaque mission part du lieu réel, de ses contraintes et des livrables qui seront vraiment exploités ensuite.',
    icon: PinDrop,
  },
  {
    title: 'Données lisibles',
    description: 'Orthophotos, modèles, plans et volumes doivent rester compréhensibles par les équipes techniques comme par les décideurs.',
    icon: Timeline,
  },
];

const roadmap = [
  'Écoute du besoin et validation du périmètre d’intervention',
  'Choix de la méthode : drone, photogrammétrie, GNSS RTK, SIG ou modélisation',
  'Acquisition terrain avec attention portée à la sécurité et aux contraintes locales',
  'Traitement des données et contrôle de cohérence des livrables',
  'Transmission de supports exploitables pour vos projets ou vos partenaires',
];

const AboutPage = () => {
  return (
    <Stack spacing={4.5}>
      <HeroSection
        eyebrow="À propos"
        title="Cartotrac relie acquisition drone, lecture du terrain et livrables techniques."
        description="La démarche Cartotrac est simple : partir d’un besoin concret, relever le terrain avec les bons moyens, puis produire des données propres pour les professionnels du bâtiment, des carrières, de la topographie, de l’agriculture, de l’architecture et du patrimoine."
        primaryCta={{ label: 'Voir les services', to: '/services' }}
        secondaryCta={{ label: 'Prendre contact', to: '/contact' }}
        highlights={['Drone', 'Topographie', 'Photogrammétrie', 'Livrables 3D']}
        cards={[
          {
            title: 'Observation',
            description: 'Voir précisément un site, une toiture, une parcelle, un ouvrage ou une zone d’exploitation.',
          },
          {
            title: 'Mesure',
            description: 'Transformer les prises de vues en surfaces, volumes, plans ou modèles numériques.',
          },
          {
            title: 'Transmission',
            description: 'Livrer des supports clairs pour vos études, diagnostics, suivis et décisions.',
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
              <Typography variant="h2">Une approche progressive</Typography>
              <Typography color="text.secondary">
                Une bonne donnée terrain dépend autant de la préparation que du vol. Cartotrac privilégie un cadrage précis, une acquisition maîtrisée et des livrables adaptés à l’usage attendu.
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
