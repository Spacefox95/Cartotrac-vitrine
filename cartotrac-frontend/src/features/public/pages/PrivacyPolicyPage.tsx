import { Grid, Link, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  const retentionItems = [
    {
      title: 'Demandes de contact et de devis',
      value: 'Jusqu’à 3 ans après le dernier contact émanant du prospect.',
    },
    {
      title: 'Compte intranet et journal d’usage associé',
      value: 'Pendant la durée d’utilisation du compte, puis suppression ou archivage limité selon les obligations applicables.',
    },
    {
      title: 'Jeton de session',
      value: 'Conservé localement dans le navigateur jusqu’à déconnexion, expiration technique ou suppression manuelle.',
    },
    {
      title: 'Brouillon cadastral local',
      value: 'Conservé uniquement dans la session du navigateur en cours puis effacé à la fermeture de l’onglet ou du navigateur selon l’environnement.',
    },
  ];

  return (
    <Stack spacing={4}>
      <PageIntro
        title="Politique de confidentialité"
        description="Cette page explique quelles données personnelles peuvent être utilisées dans Cartotrac, pourquoi elles le sont et comment exercer vos droits. Elle a été alignée sur le fonctionnement actuel du projet ; les informations sociétaires exactes devront toutefois être complétées avant une mise en production publique."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Responsable du traitement</Typography>
              <Typography color="text.secondary">Cartotrac</Typography>
              <Typography color="text.secondary">Contact RGPD : contact@cartotrac.fr</Typography>
              <Typography color="text.secondary">Les informations juridiques complètes de l’éditeur et, le cas échéant, du DPO restent à renseigner avant publication publique.</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Finalités principales</Typography>
              <Typography color="text.secondary">Répondre aux demandes entrantes, préparer un devis, gérer l’espace connecté et sécuriser l’accès aux services internes.</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.25}>
              <Typography variant="h4">Principe appliqué</Typography>
              <Typography color="text.secondary">Les formulaires et stockages locaux du projet sont limités au strict nécessaire pour rendre le service ou conserver un brouillon de travail.</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Typography variant="h2">Données traitées</Typography>
          <Typography color="text.secondary">
            Selon votre usage du site, Cartotrac peut traiter vos coordonnées de contact, le contenu de votre message, les informations utiles à votre besoin
            professionnel, les données de compte de l’espace connecté et certaines données techniques nécessaires à la session.
          </Typography>
          <Typography color="text.secondary">
            Dans le module cadastre, un brouillon peut aussi être conservé localement dans votre navigateur pour éviter la perte d’une saisie en cours. Ce
            stockage reste sur votre terminal tant que la session du navigateur reste ouverte.
          </Typography>
        </Stack>
      </Paper>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
            <Stack spacing={1.5}>
              <Typography variant="h3">Bases légales</Typography>
              <Typography color="text.secondary">
                Les demandes de contact, de démonstration ou de devis sont traitées pour répondre à votre sollicitation et prendre les mesures précontractuelles
                que vous demandez.
              </Typography>
              <Typography color="text.secondary">
                La gestion de l’espace connecté, de l’authentification et de la sécurité applicative repose sur l’exécution du service et sur l’intérêt légitime
                de protection de la plateforme.
              </Typography>
              <Typography color="text.secondary">
                Si des messages de prospection électronique ou des cookies non essentiels sont ajoutés, un mécanisme de consentement distinct devra être activé.
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
            <Stack spacing={1.5}>
              <Typography variant="h3">Destinataires</Typography>
              <Typography color="text.secondary">
                Les données sont accessibles aux seules personnes habilitées chez Cartotrac et, lorsque c’est nécessaire, à des prestataires techniques agissant
                pour l’hébergement, la maintenance ou la fourniture des services.
              </Typography>
              <Typography color="text.secondary">
                D’après l’audit du projet réalisé dans ce dépôt, aucun transfert hors Union européenne n’est recherché intentionnellement dans la configuration
                actuelle. Cette mention devra être revue si un prestataire impose un tel transfert.
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Typography variant="h2">Durées de conservation</Typography>
          <Grid container spacing={2}>
            {retentionItems.map((item) => (
              <Grid key={item.title} size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2.5, boxShadow: 'none', bgcolor: 'rgba(255,255,255,0.72)', height: '100%' }}>
                  <Stack spacing={0.75}>
                    <Typography variant="h5">{item.title}</Typography>
                    <Typography color="text.secondary">{item.value}</Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={1.5}>
          <Typography variant="h2">Vos droits</Typography>
          <Typography color="text.secondary">
            Vous pouvez demander l’accès à vos données, leur rectification, leur effacement, la limitation du traitement ou vous opposer à certains usages lorsque
            le RGPD le permet. Vous pouvez également définir des directives sur le sort de vos données après votre décès.
          </Typography>
          <Typography color="text.secondary">
            Pour exercer vos droits, écrivez à contact@cartotrac.fr en précisant votre demande. Une réponse doit en principe être apportée dans un délai d’un mois.
          </Typography>
          <Typography color="text.secondary">
            Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez saisir la CNIL. Pour en savoir plus, consultez la page
            {' '}
            <Link href="https://www.cnil.fr/fr/mes-demarches/les-droits-pour-maitriser-vos-donnees-personnelles" target="_blank" rel="noreferrer">
              Les droits pour maîtriser vos données personnelles
            </Link>
            .
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={1.5}>
          <Typography variant="h2">Avant mise en production publique</Typography>
          <Typography color="text.secondary">
            Cette politique de confidentialité est une base exploitable, mais elle devra être finalisée avec l’identité légale complète de l’éditeur, l’hébergeur,
            les sous-traitants effectivement retenus et les durées d’archivage réellement appliquées.
          </Typography>
          <Typography color="text.secondary">
            Vous pouvez retrouver le detail des points restants dans le document
            {' '}
            <Link component={RouterLink} to="/mentions-legales" underline="hover">
              Mentions légales
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

export default PrivacyPolicyPage;
