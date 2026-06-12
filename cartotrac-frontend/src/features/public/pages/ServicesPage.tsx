import {
  Anchor,
  CameraAlt,
  CheckCircleOutline,
  CleaningServices,
  Code,
  East,
  FlightTakeoff,
  Map,
  Movie,
  QueryStats,
  Straighten,
  Timeline,
} from '@mui/icons-material';
import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import HeroSection from 'features/public/components/HeroSection';

const services = [
  {
    title: 'Entretien Toiture & Façade',
    description: 'Solution d’entretien par drone pour vos toitures ou façades.',
    bullets: ['Traitement en pulvérisation basse pression', 'Intervention rapide et sécurisée', 'Approche économique pour particuliers ou professionnels'],
    icon: CleaningServices,
  },
  {
    title: 'Cadastre & Urbanisme',
    description: 'Plan de situation détaillé et lecture des données disponibles pour vos projets.',
    bullets: ['Visuel sur les données disponibles', 'Accompagnement pour vos déclarations', 'Accès via le portail public'],
    icon: Map,
  },
  {
    title: 'Relevés photogrammétriques',
    description: 'Relevé aérien couplé au GNSS terrain pour produire des données géoréférencées.',
    bullets: ['Package MNE, orthophotographie et nuage de points', 'Options d’atlas cartographiques', 'Rapports adaptés à vos sites'],
    icon: FlightTakeoff,
  },
  {
    title: 'Topographie & Implantation',
    description: 'Implantations, relevés et suivis de chantier avec récepteurs GNSS RTK.',
    bullets: ['Opérateurs équipés RTK', 'Suivi de chantier ou d’opérations', 'Relevés accessibles rapidement'],
    icon: Straighten,
  },
  {
    title: 'Cartographie, collecte & datavisualisation',
    description: 'Accompagnement pour connaître, collecter et exploiter les données disponibles.',
    bullets: ['Livrables thématiques', 'Valorisation des relevés', 'Datavisualisation pour rendre les données lisibles'],
    icon: QueryStats,
  },
  {
    title: 'Développement SIG',
    description: 'Automatisations et outils métiers pour structurer vos usages cartographiques.',
    bullets: ['Automatisations', 'PostGIS', 'Workflows QGIS et outils métiers'],
    icon: Code,
  },
];

const partnerServices = [
  {
    title: 'Relevés lidar aéroporté',
    description: 'Modèles 3D, nuages de points non texturés et rapports.',
    icon: Timeline,
  },
  {
    title: 'Relevés sonar bathymétrique',
    description: 'Modèles 3D, nuages de points non texturés et rapports.',
    icon: Anchor,
  },
  {
    title: "Film d'entreprise & Audiovisuel",
    description: 'Clips, vidéomontages professionnels ou acquisitions drone selon vos besoins.',
    icon: Movie,
  },
  {
    title: 'Photographie aérienne',
    description: 'Captation photo par drone avec un télépilote professionnel.',
    icon: CameraAlt,
  },
];

const process = [
  'Qualification du besoin : portail public, portail pro, contact ou intervention partenaire',
  'Choix de la méthode : drone, GNSS RTK, photogrammétrie, SIG, lidar, sonar ou audiovisuel',
  'Acquisition, collecte ou automatisation selon le cas d’usage',
  'Livraison des plans, données, rapports, médias ou workflows attendus',
];

const ServicesPage = () => {
  return (
    <Stack spacing={4.5}>
      <HeroSection
        eyebrow="Activités"
        title="Nous intervenons en drone, cartographie, topographie et développement SIG."
        description="Les activités Cartotrac couvrent l’entretien toiture et façade, le cadastre et l’urbanisme, les relevés photogrammétriques, la topographie, l’implantation, la collecte de données, la datavisualisation et les workflows SIG."
        primaryCta={{ label: 'Parler de votre besoin', to: '/contact' }}
        secondaryCta={{ label: 'Demander un devis', to: '/demande-devis' }}
        highlights={['Portail public', 'Portail pro', 'Drone', 'SIG']}
        cards={[
          {
            title: 'Nous intervenons',
            description: 'Des prestations directes pour vos besoins courants de terrain, cartographie et SIG.',
          },
          {
            title: 'Partenaires',
            description: 'Des expertises complémentaires pour le lidar, la bathymétrie, l’audiovisuel et la photo aérienne.',
          },
          {
            title: 'Livrables utiles',
            description: 'Plans, rapports, orthophotos, nuages de points, médias et workflows exploitables.',
          },
        ]}
      />

      <Stack spacing={2.5}>
        <Typography variant="h2">Nous intervenons</Typography>
        <Grid container spacing={2.5}>
          {services.map(({ title, description, bullets, icon: Icon }) => (
            <Grid key={title} size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Icon sx={{ color: 'primary.main', flexShrink: 0 }} />
                    <Typography variant="h3">{title}</Typography>
                  </Stack>
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
      </Stack>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2.5}>
          <Stack spacing={1.25}>
            <Typography variant="h2">Partenaires</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 780 }}>
              Certaines demandes sont couvertes avec des partenaires professionnels pour compléter les capacités drone, SIG et cartographiques.
            </Typography>
          </Stack>
          <Grid container spacing={2.5}>
            {partnerServices.map(({ title, description, icon: Icon }) => (
              <Grid key={title} size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ p: 2.5, height: '100%', boxShadow: 'none', bgcolor: 'rgba(255,255,255,0.72)' }}>
                  <Stack spacing={1.25}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Icon sx={{ color: 'primary.main', flexShrink: 0 }} />
                      <Typography variant="h4">{title}</Typography>
                    </Stack>
                    <Typography color="text.secondary">{description}</Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={1.25}>
              <Typography variant="h2">Déroulement d'une demande</Typography>
              <Typography color="text.secondary">
                L’objectif est d’orienter chaque besoin vers la bonne réponse : intervention directe, portail adapté, développement SIG ou partenaire spécialisé.
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
          <Typography variant="h2">Vous avez une activité ou un site à traiter ?</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
            Quelques informations suffisent pour commencer : localisation, objectif, données disponibles, livrables souhaités et délai.
          </Typography>
          <Button variant="contained" component={RouterLink} to="/contact" endIcon={<East />}>
            Échanger sur votre besoin
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default ServicesPage;
