import { East, FlightTakeoff, Map, ViewInAr, WorkOutline } from "@mui/icons-material";
import { Button, Grid, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import ContactSection from "features/public/components/ContactSection";
import HeroSection from "features/public/components/HeroSection";
import ServicesSection from "features/public/components/ServicesSection";

const steps = [
  {
    title: "Identifier le besoin",
    description:
      "Entretien, urbanisme, relevé, implantation, cartographie, SIG ou besoin partenaire.",
    icon: WorkOutline,
  },
  {
    title: "Acquérir les données",
    description:
      "Vol drone, GNSS RTK, collecte terrain ou mobilisation d’un partenaire spécialisé selon le contexte.",
    icon: FlightTakeoff,
  },
  {
    title: "Produire les livrables",
    description:
      "MNE, orthophotographies, nuages de points, atlas cartographiques, rapports ou workflows SIG.",
    icon: ViewInAr,
  },
  {
    title: "Exploiter simplement",
    description:
      "Des supports lisibles pour déclarer, suivre, décider, automatiser ou partager vos données.",
    icon: Map,
  },
];

const HomePage = () => {
  return (
    <Stack spacing={4.5}>
      <HeroSection
        eyebrow="Drone • SIG • Photogrammétrie"
        title="Activités drone, cartographie et SIG pour vos besoins terrain."
        description="Cartotrac intervient sur l'entretien de toitures et façades, le cadastre et l'urbanisme, les relevés photogrammétriques, la topographie, l'implantation, la cartographie, la datavisualisation et le développement SIG."
        primaryCta={{ label: "Demander un échange", to: "/contact" }}
        secondaryCta={{ label: "Découvrir nos services", to: "/services" }}
        image={{
          src: "/images/homepage/pexels-jeshoots-com-147458-442589.jpg",
          alt: "Drone professionnel en intervention aérienne",
        }}
        highlights={[
          "Entretien toiture & façade",
          "Cadastre & urbanisme",
          "Photogrammétrie",
          "Développement SIG",
        ]}
      />

      <ServicesSection />

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Stack spacing={1.25}>
            <Typography variant="h2">Une méthode claire, du besoin au livrable</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 780 }}>
              Chaque demande est orientée vers la bonne réponse : portail public, portail pro, mission drone, accompagnement SIG ou mise en relation partenaire.
            </Typography>
          </Stack>
          <Grid container spacing={2.5}>
            {steps.map(({ title, description, icon: Icon }, index) => (
              <Grid key={title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack spacing={1.25}>
                  <Typography variant="h5" color="primary.main">
                    0{index + 1}
                  </Typography>
                  <Icon sx={{ color: "primary.main" }} />
                  <Typography variant="h4">{title}</Typography>
                  <Typography color="text.secondary">{description}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>

      <ContactSection
        title="Vous avez un site à relever, mesurer ou documenter ?"
        description="Le plus simple est de partir de votre objectif : entretien de toiture ou façade, plan de situation, relevé photogrammétrique, implantation, cartographie, datavisualisation ou développement SIG."
      />

      <Paper sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h2">
            Prêt à cadrer votre prochaine demande ?
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
            Décrivez le lieu, le type d’intervention attendu et vos contraintes de délai.
            Cartotrac vous aide à choisir la réponse la plus adaptée.
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/demande-devis"
            endIcon={<East />}
          >
            Demander un devis
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default HomePage;
