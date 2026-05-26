import { ArrowOutward } from '@mui/icons-material';
import { Box, Button, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

type HeroCard = {
  title: string;
  description: string;
};

type HeroSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: {
    label: string;
    to: string;
  };
  secondaryCta?: {
    label: string;
    to: string;
  };
  highlights: string[];
  cards?: HeroCard[];
  image?: {
    src: string;
    alt: string;
  };
};


const HeroSection = ({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  highlights,
  cards,
  image,
}: HeroSectionProps) => {
  const hasSideContent = image || cards?.length;

  return (
    <Paper
      sx={{
        p: { xs: 3, md: 5 },
        overflow: 'hidden',
        background:
          'radial-gradient(circle at top right, rgba(196, 184, 166, 0.22), transparent 26%), linear-gradient(135deg, rgba(253, 250, 245, 0.96) 0%, rgba(242, 238, 232, 0.98) 100%)',
      }}
    >
      <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2.5} sx={{ height: '100%', justifyContent: 'center' }}>
            <Chip
              label={eyebrow}
              sx={{
                width: 'fit-content',
                bgcolor: 'rgba(85, 96, 111, 0.08)',
                color: 'primary.main',
                fontWeight: 700,
              }}
            />
            <Typography variant="h1" sx={{ maxWidth: 760 }}>
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
              {description}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="contained" component={RouterLink} to={primaryCta.to} endIcon={<ArrowOutward />}>
                {primaryCta.label}
              </Button>
              {secondaryCta ? (
                <Button variant="outlined" component={RouterLink} to={secondaryCta.to}>
                  {secondaryCta.label}
                </Button>
              ) : null}
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {highlights.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(85, 96, 111, 0.14)',
                    bgcolor: 'rgba(255, 255, 255, 0.64)',
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Grid>
        {hasSideContent ? (
          <Grid size={{ xs: 12, md: 5 }}>
            {image ? (
              <Box
                component="img"
                src={image.src}
                alt={image.alt}
                loading="eager"
                sx={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  minHeight: { xs: 260, md: 420 },
                  objectFit: 'cover',
                  borderRadius: 2,
                }}
              />
            ) : (
              <Stack spacing={1.5} sx={{ height: '100%', justifyContent: 'center' }}>
                {cards?.map((card) => (
                  <Paper
                    key={card.title}
                    sx={{
                      p: 2.25,
                      bgcolor: 'rgba(255, 255, 255, 0.72)',
                      boxShadow: 'none',
                    }}
                  >
                    <Stack spacing={0.75}>
                      <Typography variant="h4">{card.title}</Typography>
                      <Typography color="text.secondary">{card.description}</Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Grid>
        ) : null}
      </Grid>
    </Paper>
  );
};

export default HeroSection;
