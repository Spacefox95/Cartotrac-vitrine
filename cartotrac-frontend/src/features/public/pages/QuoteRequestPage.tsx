import { FormEvent, useMemo, useState } from 'react';
import { East, Inventory2, LocationOn, Schedule, WorkOutline } from '@mui/icons-material';
import { Alert, Button, Grid, Link, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { useAppDispatch } from 'app/store/hooks';
import { submitPublicQuoteRequest } from 'app/store/thunks/publicThunks';
import HeroSection from 'features/public/components/HeroSection';

const CONTACT_EMAIL = 'contact@cartotrac.fr';

const serviceOptions = [
  'Entretien Toiture & Façade',
  'Cadastre & Urbanisme',
  'Relevés photogrammétriques',
  'Topographie & Implantation',
  'Cartographie, collecte & datavisualisation',
  'Développement SIG',
  'Relevés lidar aéroporté',
  'Relevés sonar bathymétrique',
  "Film d'entreprise & Audiovisuel",
  'Photographie aérienne',
  'Autre besoin',
];

const prepItems = [
  {
    title: 'Le lieu concerné',
    description: 'Adresse précise, commune, parcelle, bâtiment, ouvrage ou zone à relever.',
    icon: LocationOn,
  },
  {
    title: 'Le besoin métier',
    description: 'Entretien, urbanisme, photogrammétrie, topographie, cartographie, SIG ou partenaire.',
    icon: WorkOutline,
  },
  {
    title: 'Le niveau d’urgence',
    description: 'Délais, fenêtre d’intervention, échéance client ou contrainte projet.',
    icon: Schedule,
  },
  {
    title: 'Les éléments déjà connus',
    description: 'Surface approximative, données disponibles, précision attendue, formats souhaités ou documents existants.',
    icon: Inventory2,
  },
];

const flow = [
  'Vous renseignez les informations utiles dans le formulaire.',
  'Votre demande est enregistrée pour être traitée depuis l’espace interne.',
  'Cartotrac reprend contact pour confirmer la faisabilité, les livrables et convertir la demande en devis.',
];

const initialValues = {
  name: '',
  email: '',
  phone: '',
  company: '',
  service: serviceOptions[0],
  location: '',
  deadline: '',
  details: '',
};

type QuoteRequestValues = typeof initialValues;

const QuoteRequestPage = () => {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState<QuoteRequestValues>(initialValues);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const mailtoHref = useMemo(() => buildMailtoHref(values), [values]);

  const handleChange =
    (field: keyof QuoteRequestValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrorMessage(null);
      setHasSubmitted(false);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.name.trim() || !values.email.trim() || !values.location.trim() || !values.details.trim()) {
      setErrorMessage('Veuillez renseigner au minimum votre nom, email, lieu concerné et description du besoin.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await dispatch(submitPublicQuoteRequest({
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        company: values.company || null,
        service: values.service,
        location: values.location,
        deadline: values.deadline || null,
        details: values.details,
      }));
      setHasSubmitted(true);
      setValues(initialValues);
    } catch {
      setErrorMessage('Votre demande n’a pas pu être enregistrée. Vous pouvez utiliser l’email direct ci-dessous.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={4.5}>
      <HeroSection
        eyebrow="Demande de devis"
        title="Demander un devis pour une activité Cartotrac."
        description="Renseignez votre besoin : entretien toiture ou façade, cadastre et urbanisme, relevé photogrammétrique, topographie, cartographie, développement SIG ou prestation partenaire."
        primaryCta={{ label: 'Remplir le formulaire', to: '/demande-devis' }}
        secondaryCta={{ label: 'Voir les services', to: '/services' }}
        highlights={['Localisation', 'Besoin', 'Livrables', 'Délai']}
        cards={[
          {
            title: 'Demande structurée',
            description: 'Le formulaire rassemble les informations utiles pour éviter les échanges incomplets.',
          },
          {
            title: 'Envoi immédiat',
            description: 'La demande est transmise à Cartotrac et reste disponible pour le suivi commercial.',
          },
          {
            title: 'Réponse adaptée',
            description: 'Cartotrac confirme ensuite la faisabilité, la méthode et les livrables attendus.',
          },
        ]}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
            <Stack spacing={2}>
              <Stack spacing={0.75}>
                <Typography variant="h2">Votre demande</Typography>
                <Typography color="text.secondary">
                  Les champs marqués d’un astérisque sont nécessaires pour préparer un premier retour exploitable.
                </Typography>
              </Stack>

              {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
              {hasSubmitted ? (
                <Alert severity="success">
                  Votre demande a bien été enregistrée. Cartotrac pourra la traiter depuis l’espace interne.
                </Alert>
              ) : null}

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Nom *" value={values.name} onChange={handleChange('name')} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Email *" type="email" value={values.email} onChange={handleChange('email')} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Téléphone" value={values.phone} onChange={handleChange('phone')} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Structure / société" value={values.company} onChange={handleChange('company')} fullWidth />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField select label="Type de besoin" value={values.service} onChange={handleChange('service')} fullWidth>
                    {serviceOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Lieu concerné *"
                    value={values.location}
                    onChange={handleChange('location')}
                    placeholder="Adresse, commune, parcelle, site, bâtiment..."
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Délai souhaité"
                    value={values.deadline}
                    onChange={handleChange('deadline')}
                    placeholder="Ex. dès que possible, sous 2 semaines, avant dépôt de dossier..."
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Description du besoin *"
                    value={values.details}
                    onChange={handleChange('details')}
                    placeholder="Objectif, surface approximative, livrables attendus, contraintes d’accès, documents disponibles..."
                    multiline
                    minRows={5}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button type="submit" variant="contained" endIcon={<East />} disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement...' : 'Envoyer la demande'}
                </Button>
                <Button variant="outlined" component="a" href={mailtoHref}>
                  Email direct
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2.5}>
            {prepItems.map(({ title, description, icon: Icon }) => (
              <Paper key={title} sx={{ p: 2.5, boxShadow: 'none', bgcolor: 'rgba(255,255,255,0.72)' }}>
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <Icon sx={{ mt: '2px', color: 'primary.main' }} fontSize="small" />
                  <Stack spacing={0.5}>
                    <Typography variant="h4">{title}</Typography>
                    <Typography color="text.secondary">{description}</Typography>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Grid>
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
            Vous pouvez aussi écrire directement à {CONTACT_EMAIL}. Plus de détails sont disponibles dans la{' '}
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

function buildMailtoHref(values: QuoteRequestValues) {
  const subject = `Demande de devis Cartotrac - ${values.service}`;
  const body = [
    'Bonjour,',
    '',
    'Je souhaite obtenir un devis pour une demande Cartotrac.',
    '',
    `Nom : ${values.name}`,
    `Email : ${values.email}`,
    `Téléphone : ${values.phone || 'Non renseigné'}`,
    `Structure : ${values.company || 'Non renseignée'}`,
    `Type de besoin : ${values.service}`,
    `Lieu concerné : ${values.location}`,
    `Délai souhaité : ${values.deadline || 'Non renseigné'}`,
    '',
    'Description du besoin :',
    values.details,
    '',
    'Cordialement,',
  ].join('\n');

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default QuoteRequestPage;
