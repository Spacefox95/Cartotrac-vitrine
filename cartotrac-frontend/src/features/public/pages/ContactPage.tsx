import { Email, Phone, Place, ScheduleSend } from '@mui/icons-material';
import { Grid, Link, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import HeroSection from 'features/public/components/HeroSection';

const channels = [
  {
    title: 'Email',
    value: 'contact@cartotrac.fr',
    description: 'Le meilleur point d’entrée pour transmettre une localisation, un besoin et les livrables attendus.',
    icon: Email,
  },
  {
    title: 'Téléphone',
    value: '06 00 00 00 00',
    description: 'Pratique pour cadrer rapidement une mission drone ou une contrainte terrain.',
    icon: Phone,
  },
  {
    title: 'Zone d’intervention',
    value: 'Tarn, Occitanie et interventions élargies selon mission',
    description: 'Le périmètre peut s’adapter selon le type de mission et les livrables demandés.',
    icon: Place,
  },
];

const topics = [
  'Inspecter une toiture, une façade, un ouvrage ou une zone difficile d’accès',
  'Produire une orthophoto, un MNE/MNT, un plan topographique ou un modèle 3D',
  'Calculer des volumes pour une carrière, un stock ou un terrassement',
  'Documenter une parcelle agricole, un site patrimonial ou un existant architectural',
];

const ContactPage = () => {
  return (
    <Stack spacing={4.5}>
      <HeroSection
        eyebrow="Contact"
        title="Parlons de votre site, de vos contraintes et du livrable attendu."
        description="Pour cadrer une mission, quelques éléments suffisent : localisation, objectif, surface concernée, niveau de précision souhaité, délai et format de restitution."
        primaryCta={{ label: 'Demander un devis', to: '/demande-devis' }}
        secondaryCta={{ label: 'Voir les services', to: '/services' }}
        highlights={['Réponse claire', 'Contexte terrain', 'Livrables utiles', 'Premier cadrage']}
        cards={[
          {
            title: 'Inspection',
            description: 'Toiture, façade, bâtiment, ouvrage ou zone difficilement accessible.',
          },
          {
            title: 'Relevé',
            description: 'Topographie, orthophoto, modèle numérique, plan ou mesure de volumes.',
          },
          {
            title: 'Documentation',
            description: 'Supports visuels et 3D pour architecture, patrimoine, agriculture ou suivi de site.',
          },
        ]}
      />

      <Grid container spacing={2.5}>
        {channels.map(({ title, value, description, icon: Icon }) => (
          <Grid key={title} size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Stack spacing={1.5}>
                <Icon sx={{ color: 'primary.main' }} />
                <Typography variant="h4">{title}</Typography>
                <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
                <Typography color="text.secondary">{description}</Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
            <Stack spacing={1.5}>
              <Typography variant="h2">Sujets fréquents</Typography>
              {topics.map((item) => (
                <Typography key={item} color="text.secondary">• {item}</Typography>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              height: '100%',
              background:
                'linear-gradient(135deg, rgba(85, 96, 111, 0.06) 0%, rgba(253, 250, 245, 0.92) 100%)',
            }}
          >
            <Stack spacing={1.5}>
              <ScheduleSend sx={{ color: 'primary.main' }} />
              <Typography variant="h3">Pour un premier message utile</Typography>
              <Typography color="text.secondary">Partagez l’adresse ou la zone concernée, le type de mission, les livrables souhaités et le délai visé.</Typography>
              <Typography color="text.secondary">Si vous n’avez pas encore tous les éléments techniques, ce n’est pas bloquant. L’échange sert justement à les préciser.</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={1.25}>
          <Typography variant="h3">Information données personnelles</Typography>
          <Typography color="text.secondary">
            Les informations que vous nous transmettez par email ou téléphone sont utilisées pour répondre à votre demande, qualifier votre besoin et, si vous le
            souhaitez, préparer un devis ou un prochain échange.
          </Typography>
          <Typography color="text.secondary">
            Elles sont accessibles aux seules personnes habilitées et conservées au maximum pendant 3 ans après le dernier contact lorsqu’il s’agit d’un prospect,
            sauf si une relation contractuelle est ensuite engagée.
          </Typography>
          <Typography color="text.secondary">
            Vous pouvez exercer vos droits à l’adresse contact@cartotrac.fr. En savoir plus dans la
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

export default ContactPage;
