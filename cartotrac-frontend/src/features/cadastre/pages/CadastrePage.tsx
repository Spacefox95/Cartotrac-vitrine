import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ChangeEvent, FormEvent, SyntheticEvent } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Button,
} from '@mui/material';
import L from 'leaflet';
import type { LeafletMouseEvent, Layer } from 'leaflet';
import type { Feature as GeoJsonFeature } from 'geojson';
import 'leaflet/dist/leaflet.css';

import {
  fetchAddressSuggestionsRequest,
  reverseGeocodeAddressRequest,
  searchCadastreRequest,
} from '../api/cadastreApi';
import type {
  AddressSuggestion,
  CadastreFeature,
  CadastreFeatureCollection,
  CadastreGeometry,
  CadastreSearchResponse,
  Position,
} from '../types/cadastre.types';
import { fetchQuoteRequest } from 'features/quotes/api/quotesApi';

import { createCadastrePreviewSvg, saveCadastreQuoteDraft } from '../utils/cadastreQuoteDraft';

type SearchFormState = {
  code_insee: string;
  code_dep: string;
  code_com: string;
  nom_com: string;
  section: string;
  numero: string;
};

type CadastreMapProps = {
  geojson: CadastreFeatureCollection;
  selectedIndices: number[];
  primarySelectedIndex: number;
  recommendedIndex: number | null;
  markerPoint: Position | null;
  isExpanded: boolean;
  isMeasurementMode: boolean;
  measurementPoints: Position[];
  onSelect: (index: number, appendToSelection: boolean) => void;
  onPickPoint: (point: Position) => void;
  onAddMeasurementPoint: (point: Position) => void;
  onToggleExpanded: () => void;
  onUndoMeasurementPoint: () => void;
  onUpdateMeasurementPoint: (index: number, point: Position) => void;
};

const initialValues: SearchFormState = {
  code_insee: '',
  code_dep: '',
  code_com: '',
  nom_com: '',
  section: '',
  numero: '',
};

const CadastrePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetQuoteId = Number(searchParams.get('quoteId'));
  const hasTargetQuote = Number.isInteger(targetQuoteId) && targetQuoteId > 0;
  const [values, setValues] = useState<SearchFormState>(initialValues);
  const [targetQuoteReference, setTargetQuoteReference] = useState<string | null>(null);
  const [result, setResult] = useState<CadastreSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addressQuery, setAddressQuery] = useState('');
  const [addressOptions, setAddressOptions] = useState<AddressSuggestion[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const [mapClickPoint, setMapClickPoint] = useState<Position | null>(null);
  const [manualAddressLabel, setManualAddressLabel] = useState<string | null>(null);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  const [autocompleteError, setAutocompleteError] = useState<string | null>(null);
  const [selectedFeatureIndices, setSelectedFeatureIndices] = useState<number[]>([]);
  const [isMeasurementMode, setIsMeasurementMode] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState<Position[]>([]);

  const features = useMemo(() => result?.geojson.features ?? [], [result]);
  const addressPoint = useMemo(
    () =>
      selectedAddress !== null
        ? ([selectedAddress.longitude, selectedAddress.latitude] as Position)
        : mapClickPoint,
    [mapClickPoint, selectedAddress],
  );
  const recommendedFeatureIndex = useMemo(
    () => findRecommendedFeatureIndex(features, addressPoint),
    [addressPoint, features],
  );
  const resolvedSelectedFeatureIndices = useMemo(
    () => resolveSelectedFeatureIndices(
      selectedFeatureIndices,
      features,
      recommendedFeatureIndex,
    ),
    [features, recommendedFeatureIndex, selectedFeatureIndices],
  );
  const resolvedSelectedFeatureIndex = resolvedSelectedFeatureIndices[0] ?? 0;
  const selectedFeatures = useMemo(
    () =>
      resolvedSelectedFeatureIndices
        .map((index) => features[index] ?? null)
        .filter((feature): feature is CadastreFeature => feature !== null),
    [features, resolvedSelectedFeatureIndices],
  );
  const selectedFeature = selectedFeatures[0] ?? null;
  const selectedFeatureTitle = buildSelectionTitle(features, resolvedSelectedFeatureIndices);
  const selectedFeatureSubtitle = buildSelectionSubtitle(features, resolvedSelectedFeatureIndices);
  const highlightedProperties = useMemo(
    () => getHighlightedProperties(selectedFeature),
    [selectedFeature],
  );
  const selectedFeatureArea = getSelectionAreaLabel(selectedFeatures);
  const markerPoint = useMemo(
    () => getFeatureCenter(selectedFeature) ?? addressPoint,
    [addressPoint, selectedFeature],
  );
  const currentAddressLabel = selectedAddress?.label ?? manualAddressLabel;
  const measuredArea = useMemo(
    () => computePolygonAreaSquareMeters(measurementPoints),
    [measurementPoints],
  );
  const tracePointsForQuote = measurementPoints.length >= 3 ? measurementPoints : [];
  const traceAreaForQuote = measuredArea;

  useEffect(() => {
    if (!hasTargetQuote) {
      setTargetQuoteReference(null);
      return;
    }

    let isCancelled = false;

    const loadTargetQuote = async () => {
      try {
        const response = await fetchQuoteRequest(targetQuoteId);

        if (!isCancelled) {
          setTargetQuoteReference(response.reference);
        }
      } catch {
        if (!isCancelled) {
          setTargetQuoteReference(null);
        }
      }
    };

    void loadTargetQuote();

    return () => {
      isCancelled = true;
    };
  }, [hasTargetQuote, targetQuoteId]);

  useEffect(() => {
    if (mapClickPoint === null || selectedAddress !== null) {
      setManualAddressLabel(null);
      return;
    }

    let isCancelled = false;

    const loadManualAddressLabel = async () => {
      try {
        const response = await reverseGeocodeAddressRequest(mapClickPoint[0], mapClickPoint[1]);

        if (!isCancelled) {
          setManualAddressLabel(
            response.item?.label ?? formatManualPointLabel(mapClickPoint),
          );
        }
      } catch {
        if (!isCancelled) {
          setManualAddressLabel(formatManualPointLabel(mapClickPoint));
        }
      }
    };

    void loadManualAddressLabel();

    return () => {
      isCancelled = true;
    };
  }, [mapClickPoint, selectedAddress]);

  useEffect(() => {
    const trimmedQuery = addressQuery.trim();

    if (trimmedQuery.length < 3) {
      setAddressOptions([]);
      setAutocompleteError(null);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsAutocompleteLoading(true);
        setAutocompleteError(null);
        const response = await fetchAddressSuggestionsRequest(trimmedQuery);
        setAddressOptions(response.items);
      } catch (error) {
        setAutocompleteError(extractErrorMessage(error));
      } finally {
        setIsAutocompleteLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [addressQuery]);



  const resetMeasurementSession = () => {
    setMeasurementPoints([]);
    setIsMeasurementMode(false);
  };

  const handleChange =
    (field: keyof SearchFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleAddressInputChange = (
    _event: SyntheticEvent,
    value: string,
    reason: string,
  ) => {
    setAddressQuery(value);

    if (reason === 'input') {
      setSelectedAddress(null);
    }
  };

  const handleAddressChange = (
    _event: SyntheticEvent,
    value: AddressSuggestion | null,
  ) => {
    resetMeasurementSession();
    setSelectedAddress(value);
    setMapClickPoint(null);
    setManualAddressLabel(null);
    setAddressQuery(value?.label ?? '');

    if (value === null) {
      return;
    }

    setValues((current) => ({
      ...current,
      code_insee: value.citycode ?? current.code_insee,
      nom_com: value.city ?? current.nom_com,
    }));
  };

  const runCadastreSearch = async (pointOverride?: Position | null) => {
    resetMeasurementSession();
    const activePoint = pointOverride === undefined ? addressPoint : pointOverride;
    const searchParams = {
      code_insee: values.code_insee.trim() || selectedAddress?.citycode || undefined,
      code_dep: values.code_dep.trim() || undefined,
      code_com: values.code_com.trim() || undefined,
      nom_com: values.nom_com.trim() || selectedAddress?.city || undefined,
      section: values.section.trim() || undefined,
      numero: values.numero.trim() || undefined,
      lon: activePoint?.[0],
      lat: activePoint?.[1],
      limit: activePoint ? 40 : 25,
    };

    const hasSearchInput = Boolean(
      searchParams.code_insee ||
        searchParams.code_dep ||
        searchParams.code_com ||
        searchParams.nom_com ||
        searchParams.section ||
        searchParams.numero ||
        (searchParams.lon !== undefined && searchParams.lat !== undefined),
    );

    if (!hasSearchInput) {
      setResult(null);
      setErrorMessage(
        "Renseignez au moins une adresse ou une reference cadastrale avant d'afficher les parcelles.",
      );
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await searchCadastreRequest(searchParams);
      setResult(response);
      setSelectedFeatureIndices([
        findRecommendedFeatureIndex(response.geojson.features, activePoint) ?? 0,
      ]);
    } catch (error) {
      setResult(null);
      setSelectedFeatureIndices([]);
      setErrorMessage(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFeature = (index: number, appendToSelection: boolean) => {
    setSelectedFeatureIndices((current) =>
      getNextSelectedFeatureIndices(current, index, appendToSelection),
      );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runCadastreSearch();
  };

  const handleMapPick = async (point: Position) => {
    setSelectedAddress(null);
    setMapClickPoint(point);
    setAddressQuery('');
    await runCadastreSearch(point);
  };

  const handleAddMeasurementPoint = (point: Position) => {
    setMeasurementPoints((current) => [...current, point]);
  };

  const handleUpdateMeasurementPoint = (pointIndex: number, point: Position) => {
    setMeasurementPoints((current) =>
      current.map((currentPoint, index) => (index === pointIndex ? point : currentPoint)),
    );
  };

  const handleClearMeasurement = () => {
    resetMeasurementSession();
  };

  const handleUndoMeasurementPoint = () => {
    setMeasurementPoints((current) => current.slice(0, -1));
  };

  const handleSaveTraceForQuote = () => {
    if (result === null || tracePointsForQuote.length < 3) {
      return;
    }

    const selectedParcelPolygons = selectedFeatures.flatMap((feature) =>
      geometryToPolygons(feature.geometry),
    );
    saveCadastreQuoteDraft({
      saved_at: new Date().toISOString(),
      address_label: currentAddressLabel ?? null,
      address_point: addressPoint,
      search_kind: result.search_kind,
      source_url: result.source_url,
      parcel_title: selectedFeatureTitle,
      parcel_subtitle: selectedFeatureSubtitle,
      parcel_area_label: selectedFeatureArea,
      measured_area_sqm: measuredArea,
      trace_area_sqm: traceAreaForQuote,
      trace_points: tracePointsForQuote,
      preview_svg: createCadastrePreviewSvg({
        parcelPolygons: selectedParcelPolygons,
        tracePoints: tracePointsForQuote,
        addressPoint: markerPoint,
      }),
    });

    navigate(
      hasTargetQuote
        ? `/app/quotes/${targetQuoteId}/edit?cadastre=1`
        : '/app/quotes/new',
    );
  };

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Box>
        <Typography variant="h2">Vue cadastrale</Typography>
        <Typography color="text.secondary">
          Identifiez précisément la parcelle à étudier avant de chiffrer la surface de toiture,
          façade ou emprise à traiter.
        </Typography>
        {hasTargetQuote ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Vous mettez à jour le contexte cadastre du devis{' '}
            {targetQuoteReference ? targetQuoteReference : `#${targetQuoteId}`}.
            En enregistrant ce tracé, vous reviendrez sur sa fiche de modification.
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            En enregistrant ce tracé, vous ouvrirez directement la création d&apos;un nouveau devis.
          </Alert>
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          border: '1px solid rgba(15, 23, 42, 0.08)',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
        }}
      >
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
          <Typography variant="h5">Recherche guidée</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, xl: 6 }}>
              <Autocomplete
                options={addressOptions}
                value={selectedAddress}
                inputValue={addressQuery}
                onInputChange={handleAddressInputChange}
                onChange={handleAddressChange}
                loading={isAutocompleteLoading}
                filterOptions={(options) => options}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.label === value.label}
                noOptionsText={
                  addressQuery.trim().length < 3
                    ? 'Saisissez au moins 3 caractères'
                    : 'Aucune suggestion'
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Adresse"
                    placeholder="10 rue de Rivoli, Paris"
                    helperText="Sélectionnez une adresse pour retrouver automatiquement la parcelle la plus probable."
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;
                  return (
                    <Box component="li" key={key} {...optionProps}>
                      <Stack spacing={0.25}>
                        <Typography fontWeight={700}>{option.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {[option.postcode, option.city, option.context]
                            .filter(Boolean)
                            .join(' · ')}
                        </Typography>
                      </Stack>
                    </Box>
                  );
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Code INSEE"
                value={values.code_insee}
                onChange={handleChange('code_insee')}
                placeholder="75056"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Nom commune"
                value={values.nom_com}
                onChange={handleChange('nom_com')}
                placeholder="Paris"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Code département"
                value={values.code_dep}
                onChange={handleChange('code_dep')}
                placeholder="75"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Code commune"
                value={values.code_com}
                onChange={handleChange('code_com')}
                placeholder="056"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Section"
                value={values.section}
                onChange={handleChange('section')}
                placeholder="AB"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Numéro parcelle"
                value={values.numero}
                onChange={handleChange('numero')}
                placeholder="12"
              />
            </Grid>
          </Grid>

          {selectedAddress ? (
            <Alert severity="info">
              Adresse retenue : {selectedAddress.label} ({selectedAddress.longitude.toFixed(5)},{' '}
              {selectedAddress.latitude.toFixed(5)}). Le point d'adresse est affiché sur la carte pour
              retrouver la bonne parcelle.
            </Alert>
          ) : null}

          {!selectedAddress && mapClickPoint ? (
            <Alert severity="info">
              Point manuel retenu sur la carte : {currentAddressLabel ?? formatManualPointLabel(mapClickPoint)}.
            </Alert>
          ) : null}

          {autocompleteError ? <Alert severity="warning">{autocompleteError}</Alert> : null}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
          >
            <Typography variant="body2" color="text.secondary">
              Sans section ni numéro, une adresse sélectionnée lance une recherche par point et met en
              avant la parcelle qui contient le logement cible.
            </Typography>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? 'Recherche...' : 'Afficher les parcelles'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {result && !isLoading ? (
        <Grid container spacing={2.5} alignItems="start">
          <Grid size={{ xs: 12, xl: isMapExpanded ? 12 : 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 3,
                border: '1px solid rgba(15, 23, 42, 0.08)',
                minHeight: isMapExpanded ? 860 : 720,
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h5">Aperçu cadastral interactif</Typography>
                    <Typography color="text.secondary">
                      {result.feature_count} entite{result.feature_count > 1 ? 's' : ''}{' '}
                      retournée{result.feature_count > 1 ? 's' : ''}. Cliquez sur une forme pour la
                      sélectionner. Utilisez `Ctrl` ou `Cmd` + clic pour ajouter ou retirer une
                      parcelle.
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Mode: {result.search_kind === 'parcelle' ? 'Parcelle' : 'Commune'}
                    </Typography>
                    <Button
                      variant={isMapExpanded ? 'contained' : 'outlined'}
                      onClick={() => setIsMapExpanded((current) => !current)}
                    >
                      {isMapExpanded ? 'Rétablir la mise en page' : 'Agrandir la carte'}
                    </Button>
                  </Stack>
                </Stack>
                <CadastreMap
                  geojson={result.geojson}
                  selectedIndices={resolvedSelectedFeatureIndices}
                  primarySelectedIndex={resolvedSelectedFeatureIndex}
                  recommendedIndex={recommendedFeatureIndex}
                  markerPoint={markerPoint}
                  isExpanded={isMapExpanded}
                  isMeasurementMode={isMeasurementMode}
                  measurementPoints={measurementPoints}
                  onSelect={handleSelectFeature}
                  onPickPoint={handleMapPick}
                  onAddMeasurementPoint={handleAddMeasurementPoint}
                  onToggleExpanded={() => setIsMapExpanded((current) => !current)}
                  onUndoMeasurementPoint={handleUndoMeasurementPoint}
                  onUpdateMeasurementPoint={handleUpdateMeasurementPoint}
                />
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, xl: isMapExpanded ? 12 : 4 }}>
            <Stack spacing={2.5}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h5">Outil de mesure toiture</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Activez le mode dessin puis cliquez sur la carte pour entourer le toit ou la
                    zone à étudier. Une fois les points posés, vous pouvez les déplacer par
                    glisser-déposer pour affiner la surface.
                  </Typography>
                  {measuredArea !== null ? (
                    <Alert severity="success">
                      Surface dessinée : {formatSquareMeters(measuredArea)}
                    </Alert>
                  ) : (
                    <Alert severity="info">
                      Ajoutez au moins 3 points pour calculer une surface.
                    </Alert>
                  )}
                  <Stack spacing={1}>
                    <Button
                      variant={isMeasurementMode ? 'contained' : 'outlined'}
                      onClick={() => setIsMeasurementMode((current) => !current)}
                    >
                      {isMeasurementMode ? 'Quitter le dessin' : 'Dessiner le toit'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleUndoMeasurementPoint}
                      disabled={measurementPoints.length === 0}
                    >
                      Annuler le dernier point
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSaveTraceForQuote}
                      disabled={tracePointsForQuote.length < 3 || traceAreaForQuote === null}
                    >
                      {hasTargetQuote ? 'Mettre à jour le devis avec ce tracé' : 'Créer un devis avec ce tracé'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleClearMeasurement}
                      disabled={measurementPoints.length === 0 && !isMeasurementMode}
                    >
                      Effacer le tracé
                    </Button>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Points posés : {measurementPoints.length}
                  </Typography>
                  <Alert severity="info">
                    Conseil : utilisez le fond photo IGN pour caler les sommets sur les arêtes du
                    toit, puis affinez le tracé en glisser-déposer.
                  </Alert>
                </Stack>
              </Paper>

              {recommendedFeatureIndex !== null ? (
                <Alert severity="success">
                  Parcelle recommandée pour le devis : {buildFeatureTitle(
                    features[recommendedFeatureIndex],
                    recommendedFeatureIndex,
                  )}
                </Alert>
              ) : null}


              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h5">Sélection courante</Typography>
                  <Alert severity="info">
                    {resolvedSelectedFeatureIndices.length > 1
                      ? `${resolvedSelectedFeatureIndices.length} parcelles sont retenues pour le contexte du devis.`
                      : 'Une seule parcelle est actuellement retenue.'}
                  </Alert>
                  {selectedFeatureTitle ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(88px, auto) minmax(0, 1fr)',
                        columnGap: 2,
                        alignItems: 'start',
                      }}
                    >
                      <Typography color="text.secondary">
                        {resolvedSelectedFeatureIndices.length > 1 ? 'Parcelles' : 'Parcelle'}
                      </Typography>
                      <Typography fontWeight={700} textAlign="right" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                        {selectedFeatureTitle}
                      </Typography>
                    </Box>
                  ) : null}
                  {selectedFeatureSubtitle ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(88px, auto) minmax(0, 1fr)',
                        columnGap: 2,
                        alignItems: 'start',
                      }}
                    >
                      <Typography color="text.secondary">Détails</Typography>
                      <Typography fontWeight={700} textAlign="right" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                        {selectedFeatureSubtitle}
                      </Typography>
                    </Box>
                  ) : null}
                  {currentAddressLabel ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(88px, auto) minmax(0, 1fr)',
                        columnGap: 2,
                        alignItems: 'start',
                      }}
                    >
                      <Typography color="text.secondary">Adresse</Typography>
                      <Typography fontWeight={700} textAlign="right" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                        {currentAddressLabel}
                      </Typography>
                    </Box>
                  ) : null}
                  {selectedFeatureArea ? (
                    <Alert severity="info">
                      Surface cadastrale indicative : {selectedFeatureArea}. À confirmer selon la zone
                      exacte à traiter sur le toit.
                    </Alert>
                  ) : null}
                  {highlightedProperties.length > 0 ? (
                    highlightedProperties.map(([key, value]) => (
                      <Box
                        key={key}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(88px, auto) minmax(0, 1fr)',
                          columnGap: 2,
                          alignItems: 'start',
                        }}
                      >
                        <Typography color="text.secondary">{formatPropertyLabel(key)}</Typography>
                        <Typography fontWeight={700} textAlign="right" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                          {String(value)}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      Aucune propriété exploitable sur l'entité sélectionnée.
                    </Typography>
                  )}
                  {resolvedSelectedFeatureIndices.length > 1 ? (
                    <List dense disablePadding>
                      {resolvedSelectedFeatureIndices.map((index) => (
                        <Typography key={buildFeatureKey(features[index], index)} variant="body2" color="text.secondary">
                          • {buildFeatureTitle(features[index], index)}
                        </Typography>
                      ))}
                    </List>
                  ) : null}
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h5">Source</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Requete proxyfiee par le backend Cartotrac.
                  </Typography>
                  <Divider />
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                    {result.source_url}
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      ) : null}
    </Stack>
  );
};

const CadastreMap = ({
  geojson,
  selectedIndices,
  primarySelectedIndex,
  recommendedIndex,
  markerPoint,
  isExpanded,
  isMeasurementMode,
  measurementPoints,
  onSelect,
  onPickPoint,
  onAddMeasurementPoint,
  onToggleExpanded,
  onUndoMeasurementPoint,
  onUpdateMeasurementPoint,
}: CadastreMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const parcelsLayerRef = useRef<L.FeatureGroup | null>(null);
  const pointLayerRef = useRef<L.CircleMarker | null>(null);
  const measurementLayerRef = useRef<L.LayerGroup | null>(null);
  const isMeasurementModeRef = useRef(isMeasurementMode);
  const pickPointHandlerRef = useRef(onPickPoint);
  const addMeasurementPointHandlerRef = useRef(onAddMeasurementPoint);
  const undoMeasurementPointHandlerRef = useRef(onUndoMeasurementPoint);
  const lastViewSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    isMeasurementModeRef.current = isMeasurementMode;
  }, [isMeasurementMode]);

  useEffect(() => {
    pickPointHandlerRef.current = onPickPoint;
  }, [onPickPoint]);

  useEffect(() => {
    addMeasurementPointHandlerRef.current = onAddMeasurementPoint;
  }, [onAddMeasurementPoint]);

  useEffect(() => {
    undoMeasurementPointHandlerRef.current = onUndoMeasurementPoint;
  }, [onUndoMeasurementPoint]);

  useEffect(() => {
    if (mapContainerRef.current === null || mapRef.current !== null) {
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: [46.8, 2.5],
      zoom: 6,
      zoomControl: true,
      maxZoom: 21,
    });

    const orthophotoLayer = L.tileLayer(
      'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM_0_19&FORMAT=image/jpeg&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
      {
        attribution: '&copy; IGN-F/Géoplateforme',
        maxNativeZoom: 19,
        maxZoom: 21,
      },
    );

    const planLayer = L.tileLayer(
      'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&TILEMATRIXSET=PM_0_19&FORMAT=image/png&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
      {
        attribution: '&copy; IGN-F/Géoplateforme',
        maxNativeZoom: 19,
        maxZoom: 21,
      },
    );

    orthophotoLayer.addTo(map);

    L.control
      .layers(
        {
          'Photo aérienne IGN': orthophotoLayer,
          'Plan IGN': planLayer,
        },
        undefined,
        { position: 'topright' },
      )
      .addTo(map);

    map.setMaxZoom(21);

    map.on('click', (event: LeafletMouseEvent) => {
      const point: Position = [event.latlng.lng, event.latlng.lat];
      if (isMeasurementModeRef.current) {
        addMeasurementPointHandlerRef.current(point);
        return;
      }

      pickPointHandlerRef.current(point);
    });

    map.on('contextmenu', (event: LeafletMouseEvent) => {
      if (!isMeasurementModeRef.current) {
        return;
      }

      L.DomEvent.preventDefault(event.originalEvent);
      undoMeasurementPointHandlerRef.current();
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      parcelsLayerRef.current = null;
      pointLayerRef.current = null;
      measurementLayerRef.current = null;
      lastViewSignatureRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapRef.current === null) {
      return;
    }

    parcelsLayerRef.current?.remove();
    pointLayerRef.current?.remove();
    measurementLayerRef.current?.remove();

    const parcelsLayer = L.featureGroup();
    const boundsPoints = flattenFeaturePolygons(geojson.features).flatMap((item) => item.polygon);
    geojson.features.forEach((feature, index) => {
      const isSelected = selectedIndices.includes(index);
      const isPrimarySelected = index === primarySelectedIndex;
      const isRecommended = index === recommendedIndex;

      L.geoJSON(feature as GeoJsonFeature, {
        style: {
          color: isSelected ? '#1565c0' : isRecommended ? '#2e7d32' : '#32475b',
          weight: isPrimarySelected ? 4 : isSelected ? 3 : 2,
          dashArray: isSelected && !isPrimarySelected ? '8 4' : undefined,
          fillOpacity: isMeasurementMode ? 0 : isSelected ? 0.32 : isRecommended ? 0.22 : 0.12,
          fillColor: isSelected ? '#1565c0' : isRecommended ? '#2e7d32' : '#1f2937',
        },
        onEachFeature: (_geoJsonFeature: GeoJsonFeature, layer: Layer) => {
          layer.on('click', (event: LeafletMouseEvent) => {
            L.DomEvent.stop(event);
            onSelect(index, event.originalEvent.ctrlKey || event.originalEvent.metaKey);
          });
        },
      }).addTo(parcelsLayer);
    });

    parcelsLayer.addTo(mapRef.current);
    parcelsLayerRef.current = parcelsLayer;

    if (markerPoint) {
      pointLayerRef.current = L.circleMarker([markerPoint[1], markerPoint[0]], {
        radius: 7,
        color: '#ffffff',
        weight: 2,
        fillColor: '#d32f2f',
        fillOpacity: 1,
      }).addTo(mapRef.current);
    }

    if (measurementPoints.length > 0) {
      const measurementLayer = L.layerGroup();
      const draftLatLngs = measurementPoints.map((point) => [point[1], point[0]] as [number, number]);
      const measurementShape =
        measurementPoints.length >= 3
          ? L.polygon(draftLatLngs, {
              color: '#ef6c00',
              weight: 2,
              fillColor: '#ffb300',
              fillOpacity: 0.18,
            })
          : L.polyline(draftLatLngs, {
              color: '#ef6c00',
              weight: 2,
              dashArray: '6 6',
            });

      measurementPoints.forEach((point, index) => {
        const marker = L.marker([point[1], point[0]], {
          draggable: true,
          keyboard: false,
          autoPan: true,
          icon: L.divIcon({
            className: 'cadastre-measure-marker',
            html:
              '<span style="display:block;width:14px;height:14px;border-radius:999px;background:#ef6c00;border:2px solid #ffffff;box-shadow:0 0 0 2px rgba(239,108,0,0.2);"></span>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
        });

        marker.on('dragstart', () => {
          mapRef.current?.dragging.disable();
        });

        marker.on('drag', (event) => {
          const latLng = event.target.getLatLng();
          draftLatLngs[index] = [latLng.lat, latLng.lng];
          measurementShape.setLatLngs(draftLatLngs);
        });

        marker.on('dragend', (event) => {
          const latLng = event.target.getLatLng();
          draftLatLngs[index] = [latLng.lat, latLng.lng];
          measurementShape.setLatLngs(draftLatLngs);
          mapRef.current?.dragging.enable();
          onUpdateMeasurementPoint(index, [latLng.lng, latLng.lat]);
        });

        marker.addTo(measurementLayer);
      });

      measurementShape.addTo(measurementLayer);
      measurementLayer.addTo(mapRef.current);
      measurementLayerRef.current = measurementLayer;
    }

    const geometryBounds = computeBounds(boundsPoints);
    const viewSignature = JSON.stringify({
      featureCount: geojson.features.length,
      geometryBounds,
      markerPoint,
    });

    if (lastViewSignatureRef.current !== viewSignature) {
      if (geometryBounds !== null) {
        mapRef.current.fitBounds(
          [
            [geometryBounds.minY, geometryBounds.minX],
            [geometryBounds.maxY, geometryBounds.maxX],
          ],
          { padding: [24, 24] },
        );
      } else if (markerPoint) {
        mapRef.current.setView([markerPoint[1], markerPoint[0]], 19);
      }

      lastViewSignatureRef.current = viewSignature;
    }
  }, [
    geojson,
    markerPoint,
    isMeasurementMode,
    measurementPoints,
    onAddMeasurementPoint,
    onPickPoint,
    onSelect,
    onUndoMeasurementPoint,
    onUpdateMeasurementPoint,
    recommendedIndex,
    primarySelectedIndex,
    selectedIndices,
  ]);

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        minHeight: isExpanded ? { xs: 620, md: 860, xl: 940 } : { xs: 520, md: 720, xl: 780 },
        '& .leaflet-container': {
          minHeight: isExpanded ? { xs: 620, md: 860, xl: 940 } : { xs: 520, md: 720, xl: 780 },
          width: '100%',
          fontFamily: 'inherit',
        },
      }}
    >
      <Tooltip title={isExpanded ? 'Reduire la carte' : 'Agrandir la carte'}>
        <IconButton
          onClick={onToggleExpanded}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 1000,
            width: 34,
            height: 34,
            border: '1px solid rgba(15, 23, 42, 0.12)',
            borderRadius: 2.5,
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.14)',
            color: '#0f172a',
            '&:hover': {
              backgroundColor: '#ffffff',
            },
          }}
        >
          <Box component="span" sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
            {isExpanded ? '↙' : '↗'}
          </Box>
        </IconButton>
      </Tooltip>
      <Box ref={mapContainerRef} />
    </Box>
  );
};

function formatManualPointLabel(point: Position | null): string | null {
  if (point === null) {
    return null;
  }

  return `Point manuel (${point[1].toFixed(5)}, ${point[0].toFixed(5)})`;
}


function flattenFeaturePolygons(features: CadastreFeature[]) {
  return features.flatMap((feature, featureIndex) =>
    geometryToPolygons(feature.geometry).map((polygon) => ({
      featureIndex,
      polygon,
    })),
  );
}

function getFeatureCenter(feature: CadastreFeature | null): Position | null {
  if (feature === null) {
    return null;
  }

  const polygons = geometryToPolygons(feature.geometry);
  const bounds = computeBounds(polygons.flat());

  if (bounds === null) {
    return null;
  }

  return [(bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2];
}


function geometryToPolygons(geometry: CadastreGeometry | null): Position[][] {
  if (geometry === null) {
    return [];
  }

  if (geometry.type === 'Polygon') {
    return [geometry.coordinates[0] ?? []];
  }

  return geometry.coordinates.map((polygon) => polygon[0] ?? []);
}

function computeBounds(points: Position[]) {
  if (points.length === 0) {
    return null;
  }

  return points.reduce(
    (current, [x, y]) => ({
      minX: Math.min(current.minX, x),
      minY: Math.min(current.minY, y),
      maxX: Math.max(current.maxX, x),
      maxY: Math.max(current.maxY, y),
    }),
    {
      minX: points[0][0],
      minY: points[0][1],
      maxX: points[0][0],
      maxY: points[0][1],
    },
  );
}

function findRecommendedFeatureIndex(
  features: CadastreFeature[],
  addressPoint: Position | null,
) {
  if (addressPoint === null) {
    return null;
  }

  for (let index = 0; index < features.length; index += 1) {
    const polygons = geometryToPolygons(features[index].geometry);
    if (polygons.some((polygon) => isPointInsidePolygon(addressPoint, polygon))) {
      return index;
    }
  }

  return null;
}

function isPointInsidePolygon(point: Position, polygon: Position[]) {
  if (polygon.length < 3) {
    return false;
  }

  const [px, py] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersects =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / ((yj - yi) || Number.EPSILON) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function getHighlightedProperties(feature: CadastreFeature | null) {
  if (feature === null) {
    return [] as Array<[string, string | number | boolean | null]>;
  }

  const preferredKeys = [
    'nom_com',
    'code_insee',
    'section',
    'numero',
    'contenance',
    'surface',
    'idu',
    'code_dep',
    'code_com',
  ];

  const entries = preferredKeys
    .filter(
      (key) =>
        key in feature.properties &&
        feature.properties[key] !== null &&
        feature.properties[key] !== '',
    )
    .map(
      (key) =>
        [key, feature.properties[key]] as [string, string | number | boolean | null],
    );

  if (entries.length > 0) {
    return entries;
  }

  return Object.entries(feature.properties)
    .filter(([, value]) => value !== null && value !== '')
    .slice(0, 8);
}

function computePolygonAreaSquareMeters(points: Position[]) {
  if (points.length < 3) {
    return null;
  }

  const projected = points.map(([lon, lat]) => projectToMeters(lon, lat));
  let sum = 0;

  for (let index = 0; index < projected.length; index += 1) {
    const current = projected[index];
    const next = projected[(index + 1) % projected.length];
    sum += current[0] * next[1] - next[0] * current[1];
  }

  return Math.abs(sum) / 2;
}

function projectToMeters(lon: number, lat: number): [number, number] {
  const earthRadius = 6378137;
  const x = (lon * Math.PI * earthRadius) / 180;
  const y =
    Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * earthRadius;

  return [x, y];
}

function formatSquareMeters(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: value >= 1000 ? 0 : 1,
  }).format(value) + ' m2';
}

function getFeatureAreaLabel(feature: CadastreFeature | null) {
  if (feature === null) {
    return null;
  }

  const value = feature.properties.contenance ?? feature.properties.surface;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(value) + ' m2';
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim() + (value.includes('m2') ? '' : ' m2');
  }

  return null;
}

function buildFeatureKey(feature: CadastreFeature, index: number) {
  const idu = feature.properties.idu;
  return typeof idu === 'string' && idu.length > 0 ? idu : `feature-${index}`;
}

function buildFeatureTitle(feature: CadastreFeature, index: number) {
  const section = feature.properties.section;
  const numero = feature.properties.numero;
  const city = feature.properties.nom_com;

  if (typeof section === 'string' && numero !== null && numero !== undefined) {
    return `Parcelle ${section}-${String(numero)}`;
  }

  if (typeof city === 'string' && city.length > 0) {
    return city;
  }

  return `Entite ${index + 1}`;
}

function buildFeatureSubtitle(feature: CadastreFeature) {
  return [
    feature.properties.nom_com,
    feature.properties.code_insee,
    getFeatureAreaLabel(feature),
    feature.properties.idu,
  ]
    .filter((value) => value !== null && value !== undefined && value !== '')
    .map((value) => String(value))
    .join(' · ');
}

function getNextSelectedFeatureIndices(
  currentIndices: number[],
  targetIndex: number,
  appendToSelection: boolean,
) {
  if (!appendToSelection) {
    return [targetIndex];
  }

  if (currentIndices.includes(targetIndex)) {
    const nextIndices = currentIndices.filter((index) => index !== targetIndex);
    return nextIndices.length > 0 ? nextIndices : [targetIndex];
  }

  return [...currentIndices, targetIndex];
}

function resolveSelectedFeatureIndices(
  selectedIndices: number[],
  features: CadastreFeature[],
  recommendedIndex: number | null,
) {
  const sanitizedIndices = Array.from(new Set(selectedIndices)).filter(
    (index) => features[index] !== undefined,
  );

  if (sanitizedIndices.length > 0) {
    return sanitizedIndices;
  }

  if (features.length === 0) {
    return [];
  }

  return [recommendedIndex ?? 0];
}

function getNumericFeatureArea(feature: CadastreFeature) {
  const value = feature.properties.contenance ?? feature.properties.surface;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = Number(value.replace(',', '.').replace(/[^\d.]+/g, ''));
    return Number.isFinite(normalized) ? normalized : null;
  }

  return null;
}

function buildSelectionTitle(features: CadastreFeature[], selectedIndices: number[]) {
  if (selectedIndices.length === 0) {
    return null;
  }

  if (selectedIndices.length === 1) {
    const feature = features[selectedIndices[0]];
    return feature ? buildFeatureTitle(feature, selectedIndices[0]) : null;
  }

  const labels = selectedIndices
    .map((index) => features[index])
    .filter((feature): feature is CadastreFeature => feature !== undefined)
    .map((feature, listIndex) => buildFeatureTitle(feature, selectedIndices[listIndex]));

  if (labels.length <= 3) {
    return labels.join(' · ');
  }

  return `${labels.slice(0, 3).join(' · ')} + ${labels.length - 3} autre(s)`;
}

function buildSelectionSubtitle(features: CadastreFeature[], selectedIndices: number[]) {
  if (selectedIndices.length === 0) {
    return null;
  }

  if (selectedIndices.length === 1) {
    const feature = features[selectedIndices[0]];
    return feature ? buildFeatureSubtitle(feature) : null;
  }

  const selectedFeatures = selectedIndices
    .map((index) => features[index])
    .filter((feature): feature is CadastreFeature => feature !== undefined);
  const cities = Array.from(
    new Set(
      selectedFeatures
        .map((feature) => feature.properties.nom_com)
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    ),
  );
  const cityLabel = cities.length === 1 ? cities[0] : `${cities.length} communes`;
  return `${selectedFeatures.length} parcelles${cityLabel ? ` · ${cityLabel}` : ''}`;
}

function getSelectionAreaLabel(features: CadastreFeature[]) {
  if (features.length === 0) {
    return null;
  }

  if (features.length === 1) {
    return getFeatureAreaLabel(features[0]);
  }

  const numericAreas = features
    .map((feature) => getNumericFeatureArea(feature))
    .filter((value): value is number => value !== null);

  if (numericAreas.length === features.length) {
    return `${formatSquareMeters(
      numericAreas.reduce((sum, value) => sum + value, 0),
    )} au total`;
  }

  return `Surface non agrégée sur ${features.length} parcelles`;
}

function formatPropertyLabel(value: string) {
  return value.replaceAll('_', ' ');
}

function extractErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'detail' in error.response.data
  ) {
    const detail = error.response.data.detail;
    if (typeof detail === 'string') {
      return detail;
    }
  }

  return 'Recherche cadastrale impossible pour le moment.';
}

export default CadastrePage;
