import { East, Hub, Layers, PrecisionManufacturing, Route, SatelliteAlt } from '@mui/icons-material';
import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import ContactSection from 'features/public/components/ContactSection';
import FooterSection from 'features/public/components/FooterSection';
import HeroSection from 'features/public/components/HeroSection';
import ServicesSection from 'features/public/components/ServicesSection';

const services = [
  {
    title: 'Lecture d’adresse et qualification parcellaire',
    description: 'Localiser rapidement la bonne parcelle, comprendre son contour et préparer une base de travail propre.',
    detail: 'Cadastre, contexte et sélection utile dans un même flux.',
  },
  {
    title: 'Mesure toiture et repérage préparatoire',
    description: 'Tracer finement une zone à traiter pour préparer un chiffrage ou un échange terrain plus crédible.',
    detail: 'Un outil simple pour transformer une carte en surface exploitable.',
  },
  {
    title: 'Clients, demandes et devis reliés',
    description: 'Passer du besoin entrant à un devis documenté sans perdre l’historique de qualification.',
    detail: 'Le commercial et le terrain parlent enfin sur la même base.',
  },
  {
    title: 'Socle métier prêt à évoluer',
    description: 'Préparer ensuite l’arrivée de missions, drones, visualisation ou automatisations métier.',
    detail: 'Une base légère aujourd’hui, extensible demain.',
  },
];

const steps = [
  {
    title: 'Capter la demande',
    text: 'Le site vitrine clarifie l’offre, oriente les contacts et prépare des échanges mieux cadrés.',
    icon: Hub,
  },
  {
    title: 'Qualifier la zone',
    text: 'Depuis une adresse ou un clic carte, Cartotrac aide à retrouver la bonne parcelle et le bon contexte.',
    icon: SatelliteAlt,
  },
  {
    title: 'Préparer le chiffrage',
    text: 'Le tracé de toiture et le contexte cadastral sont conservés pour alimenter le devis.',
    icon: Route,
  },
  {
    title: 'Piloter la suite',
    text: 'Clients, devis et prochaines briques métier restent sur une base cohérente.',
    icon: Layers,
  },
];

const useCases = [
  'Couverture, façade, enveloppe et inspection préparatoire',
  'Prospection locale avec qualification rapide avant déplacement',
  'Activités terrain qui veulent mieux relier lecture cartographique et cycle commercial',
];

const HomePage = () => {
  return (
    <Stack spacing={4.5}>
      <HeroSection
        eyebrow="Site vitrine et outil métier cartographique"
        title="Le repérage terrain devient plus lisible, plus commercial, plus exploitable."
        description="Cartotrac réunit vitrine, lecture cadastrale, qualification d’une adresse et préparation de devis dans une expérience simple à prendre en main. L’objectif n’est pas d’ajouter une couche d’outil de plus, mais de donner une colonne vertébrale claire aux activités qui doivent comprendre un lieu avant d’agir."
        primaryCta={{ label: 'Demander un échange', to: '/contact' }}
        secondaryCta={{ label: 'Découvrir les services', to: '/services' }}
        highlights={['Cadastre et parcelles', 'Mesure toiture', 'Clients et devis', 'Socle métier évolutif']}
        cards={[
          {
            title: 'Avant déplacement',
            description: 'Comprendre la parcelle, préparer le contexte et cadrer la demande avant de mobiliser du temps terrain.',
          },
          {
            title: 'Avant chiffrage',
            description: 'Relier une lecture cartographique claire à un devis mieux documenté, plus crédible et plus rapide à produire.',
          },
          {
            title: 'Avant extension métier',
            description: 'Construire une base propre pour accueillir ensuite d’autres briques utiles sans repartir de zéro.',
          },
        ]}
      />

      <Grid container spacing={2.5}>
        {useCases.map((text, index) => {
          const icons = [PrecisionManufacturing, SatelliteAlt, East];
          const Icon = icons[index % icons.length];
          return (
            <Grid key={text} size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Stack spacing={1.5}>
                  <Icon sx={{ color: 'primary.main' }} />
                  <Typography variant="h4">Cas d’usage {index + 1}</Typography>
                  <Typography color="text.secondary">{text}</Typography>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <ServicesSection
        title="Ce que la plateforme apporte aujourd’hui"
        description="La version actuelle se concentre sur les briques qui donnent immédiatement de la valeur aux équipes terrain et aux fonctions commerciales."
        items={services}
        ctaLabel="Voir le détail des services"
        ctaTo="/services"
      />

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Typography variant="h2">Une méthode simple en quatre temps</Typography>
          <Grid container spacing={2.5}>
            {steps.map(({ title, text, icon: Icon }, index) => (
              <Grid key={title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack spacing={1.25}>
                  <Typography variant="h5" color="primary.main">
                    0{index + 1}
                  </Typography>
                  <Icon sx={{ color: 'primary.main' }} />
                  <Typography variant="h4">{title}</Typography>
                  <Typography color="text.secondary">{text}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>

      <FooterSection
        title="Une base sérieuse pour une activité en mouvement"
        description="Cartotrac n’essaie pas de tout faire d’un coup. La plateforme pose d’abord les fondations qui fluidifient le quotidien, puis ouvre la porte à des extensions métier réellement utiles."
        stats={[
          { value: '1', label: 'socle vitrine et intranet cohérent' },
          { value: '4', label: 'briques déjà actives : auth, clients, devis, cadastre' },
          { value: '∞', label: 'possibilités d’extension selon vos usages terrain' },
        ]}
      />

      <ContactSection
        title="Vous voulez voir si Cartotrac colle à votre façon de travailler ?"
        description="Le plus simple est de partir d’un besoin réel : un secteur à couvrir, une activité à structurer, un cycle devis à clarifier ou une préparation terrain à fluidifier."
      />

      <Paper sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h2">Prêt à cadrer votre prochain flux terrain ?</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
            Demandes entrantes, lecture d’adresse, cadastre, mesure et devis peuvent déjà travailler ensemble. Le site vitrine sert maintenant de façade claire à cette logique métier.
          </Typography>
          <Button variant="contained" component={RouterLink} to="/demande-devis" endIcon={<East />}>
            Ouvrir une demande de devis
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default HomePage;
