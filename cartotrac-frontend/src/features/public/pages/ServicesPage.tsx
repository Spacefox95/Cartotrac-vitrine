import { CheckCircleOutline, East, Explore, Map, RequestQuote, ViewInAr } from '@mui/icons-material';
import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import HeroSection from 'features/public/components/HeroSection';

const services = [
  {
    title: 'Repérage cadastral',
    description: 'Identifier rapidement la bonne parcelle, vérifier ses références et conserver un contexte clair pour la suite.',
    bullets: ['Recherche par adresse ou références cadastrales', 'Sélection de parcelle plus lisible', 'Contexte directement exploitable dans le devis'],
    icon: Map,
  },
  {
    title: 'Mesure et préparation toiture',
    description: 'Tracer une zone utile sur carte pour préparer le chiffrage ou l’échange technique sur une base commune.',
    bullets: ['Dessin manuel précis', 'Ajustement des points du tracé', 'Export du contexte dans le flux devis'],
    icon: Explore,
  },
  {
    title: 'Gestion commerciale reliée au terrain',
    description: 'Clients, demandes et devis restent connectés à la réalité du site étudié.',
    bullets: ['Création et suivi de clients', 'Devis structurés', 'Conservation du contexte cadastre dans le dossier'],
    icon: RequestQuote,
  },
  {
    title: 'Plateforme prête à grandir',
    description: 'Le socle est pensé pour accueillir des briques futures sans reconstruire toute l’interface.',
    bullets: ['Missions et opérations', 'Drones ou captation', 'Prévisualisation et enrichissement 3D'],
    icon: ViewInAr,
  },
];

const process = [
  'Analyse du besoin et de la façon de travailler actuelle',
  'Cadrage des écrans prioritaires et des flux critiques',
  'Mise en place d’un socle simple à utiliser par l’équipe',
  'Ajout progressif des briques complémentaires les plus rentables',
];

const ServicesPage = () => {
  return (
    <Stack spacing={4.5}>
      <HeroSection
        eyebrow="Services"
        title="Des outils pensés pour les activités qui doivent lire un lieu avant de vendre, planifier ou intervenir."
        description="Cartotrac couvre le point de rencontre entre repérage cartographique, compréhension parcellaire et préparation commerciale. L’idée n’est pas de remplacer tous vos outils, mais d’organiser ce qui vous fait gagner du temps sur le terrain et dans le cycle devis."
        primaryCta={{ label: 'Parler de votre besoin', to: '/contact' }}
        secondaryCta={{ label: 'Demander un devis', to: '/demande-devis' }}
        highlights={['Repérage', 'Mesure', 'Devis', 'Évolutivité']}
        cards={[
          {
            title: 'Pour les équipes terrain',
            description: 'Une lecture plus nette d’une adresse, d’une parcelle et d’une zone à traiter avant déplacement.',
          },
          {
            title: 'Pour le commerce',
            description: 'Un passage plus fluide de la qualification au chiffrage, sans rupture d’information.',
          },
          {
            title: 'Pour la structure',
            description: 'Une base plus saine pour brancher ensuite d’autres modules réellement utiles.',
          },
        ]}
      />

      <Grid container spacing={2.5}>
        {services.map(({ title, description, bullets, icon: Icon }) => (
          <Grid key={title} size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Stack spacing={1.5}>
                <Icon sx={{ color: 'primary.main' }} />
                <Typography variant="h3">{title}</Typography>
                <Typography color="text.secondary">{description}</Typography>
                <Stack spacing={1}>
                  {bullets.map((item) => (
                    <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
                      <CheckCircleOutline sx={{ fontSize: 18, mt: '2px', color: 'primary.main' }} />
                      <Typography color="text.secondary">{item}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={1.25}>
              <Typography variant="h2">Notre logique de déploiement</Typography>
              <Typography color="text.secondary">
                On commence par les points de friction qui coûtent du temps au quotidien, puis on ajoute seulement les briques qui renforcent vraiment la chaîne de valeur.
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={1.5}>
              {process.map((item, index) => (
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

      <Paper sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h2">Vous avez déjà un cas métier précis en tête ?</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
            On peut partir d’un usage simple, comme la préparation d’un devis toiture ou la qualification d’une adresse, puis étendre l’outil à partir de ce premier noyau utile.
          </Typography>
          <Button variant="contained" component={RouterLink} to="/contact" endIcon={<East />}>
            Échanger sur votre cas d’usage
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default ServicesPage;
