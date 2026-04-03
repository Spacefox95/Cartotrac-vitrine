import { Email, Phone, Place, ScheduleSend } from '@mui/icons-material';
import { Grid, Paper, Stack, Typography } from '@mui/material';

import HeroSection from 'features/public/components/HeroSection';

const channels = [
  {
    title: 'Email',
    value: 'contact@cartotrac.fr',
    description: 'Le meilleur point d’entrée pour partager un contexte, une adresse ou un besoin un peu détaillé.',
    icon: Email,
  },
  {
    title: 'Téléphone',
    value: '06 00 00 00 00',
    description: 'Pratique pour un premier cadrage rapide ou une demande simple.',
    icon: Phone,
  },
  {
    title: 'Zone d’intervention',
    value: 'Tarn, Occitanie et interventions élargies selon mission',
    description: 'Le périmètre peut s’adapter selon le type d’accompagnement ou d’outil souhaité.',
    icon: Place,
  },
];

const topics = [
  'Préparer un flux devis plus cohérent à partir d’une adresse ou d’une parcelle',
  'Qualifier plus vite un chantier toiture, façade ou emprise à traiter',
  'Mettre en place un socle léger entre vitrine, prospection et gestion interne',
  'Étendre ensuite l’outil vers d’autres modules métier',
];

const ContactPage = () => {
  return (
    <Stack spacing={4.5}>
      <HeroSection
        eyebrow="Contact"
        title="Parlons d’un besoin réel, pas d’un vague projet logiciel."
        description="Le plus utile pour commencer est de partir d’un cas concret : une adresse à qualifier, un cycle devis à fluidifier, un flux terrain à clarifier ou une activité à structurer. Cela permet de voir immédiatement si Cartotrac est la bonne base et par où démarrer."
        primaryCta={{ label: 'Demander un devis', to: '/demande-devis' }}
        secondaryCta={{ label: 'Voir les services', to: '/services' }}
        highlights={['Réponse claire', 'Contexte métier', 'Cas concret', 'Premier cadrage']}
        cards={[
          {
            title: 'Besoin opérationnel',
            description: 'Nous pouvons partir d’un usage simple et immédiat pour éviter les cadrages trop abstraits.',
          },
          {
            title: 'Besoin produit',
            description: 'Le contact peut aussi servir à discuter d’une trajectoire d’outil interne plus large.',
          },
          {
            title: 'Besoin commercial',
            description: 'Site vitrine, demandes entrantes et devis peuvent être pensés comme une seule chaîne.',
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
              <Typography color="text.secondary">Partagez simplement l’adresse ou la zone concernée, le type de besoin et le délai visé. Cela suffit pour cadrer la suite.</Typography>
              <Typography color="text.secondary">Si vous n’avez pas encore tous les éléments, ce n’est pas bloquant. L’échange sert aussi à les faire émerger proprement.</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ContactPage;
