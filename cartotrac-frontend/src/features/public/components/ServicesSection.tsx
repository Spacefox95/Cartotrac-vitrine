import {
  ArrowOutward,
  Code,
  CleaningServices,
  FlightTakeoff,
  Map,
  QueryStats,
  Straighten,
} from "@mui/icons-material";

import { Button, Grid, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const services = [
  {
    title: "Entretien Toiture & Façade",
    description:
      "Traitement en pulvérisation basse pression par drone pour l'entretien de vos toitures ou façades.",
    detail: "Rapide, sécurisé et économique.",
    icon: CleaningServices,
  },
  {
    title: "Cadastre & Urbanisme",
    description:
      "Plan de situation détaillé, visuel des données disponibles et accompagnement pour vos déclarations.",
    detail: "Portail public disponible.",
    icon: Map,
  },
  {
    title: "Relevés photogrammétriques",
    description:
      "Relevé aérien couplé au GNSS terrain avec MNE, orthophotographie et nuage de points géoréférencés.",
    detail: "Options d'atlas cartographiques et de rapports.",
    icon: FlightTakeoff,
  },
  {
    title: "Topographie & Implantation",
    description:
      "Implantations, relevés et suivis de chantier avec opérateurs équipés de récepteurs GNSS RTK.",
    detail: "Accessible en quelques clics.",
    icon: Straighten,
  },
  {
    title: "Cartographie & datavisualisation",
    description:
      "Collecte, exploitation des données disponibles, livrables thématiques et accompagnement datavisualisation.",
    detail: "Pour mieux lire et partager vos données.",
    icon: QueryStats,
  },
  {
    title: "Développement SIG",
    description:
      "Automatisations, PostGIS, outils métiers et workflows QGIS adaptés à vos usages.",
    detail: "Accompagnement sur mesure.",
    icon: Code,
  },
];

const ServicesSection = () => {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        <Stack spacing={1.25}>
          <Typography variant="h2">
            Domaines d'intervention
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 780 }}>
            Des prestations drone, cartographiques et SIG pour entretenir, relever, implanter, analyser et valoriser vos données terrain.
          </Typography>
        </Stack>
        <Grid container spacing={2.5}>
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <Grid key={item.title} size={{ xs: 12, md: 6 }}>
                <Paper
                  sx={{
                    p: 2.75,
                    height: "100%",
                    bgcolor: "rgba(255,255,255,0.72)",
                    boxShadow: "none",
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Icon sx={{ color: "primary.main", flexShrink: 0 }} />
                      <Typography variant="h4">{item.title}</Typography>
                    </Stack>
                    <Typography color="text.secondary">
                      {item.description}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "primary.main", fontWeight: 700 }}
                    >
                      {item.detail}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
        <Button
          variant="contained"
          component={RouterLink}
          to="/services"
          endIcon={<ArrowOutward />}
          sx={{ width: "fit-content" }}
        >
          Voir le détail des services
        </Button>
      </Stack>
    </Paper>
  );
};

export default ServicesSection;
