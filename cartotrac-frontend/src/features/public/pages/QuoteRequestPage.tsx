import { East, Inventory2, LocationOn, Schedule, WorkOutline } from '@mui/icons-material';
import { Button, Grid, Link, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import HeroSection from 'features/public/components/HeroSection';

const prepItems = [
  {
    title: 'Le lieu concerné',
    description: 'Adresse précise, commune, secteur ou zone d’intervention à qualifier.',
    icon: LocationOn,
  },
  {
    title: 'Le besoin métier',
    description: 'Toiture, façade, emprise, repérage, prospection ou autre demande préparatoire.',
    icon: WorkOutline,
  },
  {
    title: 'Le niveau d’urgence',
    description: 'Délais, fenêtre d’intervention, échéance client ou contrainte projet.',
    icon: Schedule,
  },
  {
    title: 'Les éléments déjà connus',
    description: 'Surface approximative, contexte du site, documents ou hypothèses existantes.',
    icon: Inventory2,
  },
];

const flow = [
  'Prise de contact et qualification rapide du besoin',
  'Lecture du contexte adresse et parcelle si nécessaire',
  'Cadrage de la réponse utile : devis, démo ou prochain échange',
];

const QuoteRequestPage = () => {
  return (
    <Stack spacing={4.5}>
      <HeroSection
        eyebrow="Demande de devis"
        title="Un premier échange clair vaut mieux qu’un formulaire trop long et peu exploitable."
        description="Pour l’instant, la demande de devis Cartotrac passe par une prise de contact directe. C’est volontaire : cela permet de qualifier le besoin proprement, de comprendre le contexte terrain et de préparer la bonne suite sans forcer un tunnel public prématuré."
        primaryCta={{ label: 'Nous contacter', to: '/contact' }}
        secondaryCta={{ label: 'Voir les services', to: '/services' }}
        highlights={['Adresse', 'Contexte terrain', 'Chiffrage', 'Échange rapide']}
        cards={[
          {
            title: 'Si vous avez un besoin précis',
            description: 'Nous pouvons partir immédiatement d’une adresse, d’un type de chantier ou d’un flux devis à améliorer.',
          },
          {
            title: 'Si le besoin est encore flou',
            description: 'Un premier échange sert justement à cadrer le bon point de départ sans surcharger la demande.',
          },
          {
            title: 'Si vous pensez plus outil que prestation',
            description: 'Le contact permet aussi de voir comment le socle Cartotrac peut s’adapter à votre activité.',
          },
        ]}
      />

      <Grid container spacing={2.5}>
        {prepItems.map(({ title, description, icon: Icon }) => (
          <Grid key={title} size={{ xs: 12, sm: 6 }}>
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
        <Stack spacing={2.5}>
          <Typography variant="h2">Comment la demande est traitée</Typography>
          <Stack spacing={1.25}>
            {flow.map((item, index) => (
              <Paper key={item} sx={{ p: 2.25, boxShadow: 'none', bgcolor: 'rgba(255,255,255,0.72)' }}>
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <Typography variant="h5" color="primary.main">0{index + 1}</Typography>
                  <Typography color="text.secondary">{item}</Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h2">Envie d’ouvrir la discussion ?</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
            Même quelques lignes suffisent : adresse, type de besoin, niveau d’urgence. Nous utiliserons ensuite ce point d’entrée pour structurer la bonne réponse.
          </Typography>
          <Button variant="contained" component={RouterLink} to="/contact" endIcon={<East />}>
            Aller à la page contact
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={1.25}>
          <Typography variant="h3">Traitement des demandes</Typography>
          <Typography color="text.secondary">
            Les informations communiquées pour une demande de devis sont utilisées pour étudier votre besoin, reprendre contact avec vous et préparer une proposition
            adaptée.
          </Typography>
          <Typography color="text.secondary">
            Ne transmettez que les informations utiles au cadrage de la demande. Les données de prospects sont conservées au maximum 3 ans après le dernier contact,
            sauf poursuite de la relation dans un cadre contractuel.
          </Typography>
          <Typography color="text.secondary">
            Plus de détails sont disponibles dans la
            {' '}
            <Link component={RouterLink} to="/confidentialite" underline="hover">
              politique de confidentialité
            </Link>
            .
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default QuoteRequestPage;
