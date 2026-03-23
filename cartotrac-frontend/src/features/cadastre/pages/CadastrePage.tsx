import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ListItemButton,
  ListItemText,
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
  fetchBuildingFootprintEstimateRequest,
  searchCadastreRequest,
} from '../api/cadastreApi';
import type {
  AddressSuggestion,
  BuildingFootprintEstimateResponse,
  CadastreFeature,
  CadastreFeatureCollection,
  CadastreGeometry,
  CadastreSearchResponse,
  Position,
} from '../types/cadastre.types';
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
  selectedIndex: number;
  recommendedIndex: number | null;
  addressPoint: Position | null;
  buildingEstimate: BuildingFootprintEstimateResponse | null;
  isExpanded: boolean;
  isMeasurementMode: boolean;
  measurementPoints: Position[];
  onSelect: (index: number) => void;
  onPickPoint: (point: Position) => void;
  onAddMeasurementPoint: (point: Position) => void;
  onToggleExpanded: () => void;
  onUpdateMeasurementPoint: (index: number, point: Position) => void;
};

type PolygonEntry = {
  featureIndex: number;
  polygon: Position[];
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
  const [values, setValues] = useState<SearchFormState>(initialValues);
  const [result, setResult] = useState<CadastreSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addressQuery, setAddressQuery] = useState('');
  const [addressOptions, setAddressOptions] = useState<AddressSuggestion[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const [mapClickPoint, setMapClickPoint] = useState<Position | null>(null);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  const [autocompleteError, setAutocompleteError] = useState<string | null>(null);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0);
  const [isMeasurementMode, setIsMeasurementMode] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState<Position[]>([]);
  const [buildingEstimate, setBuildingEstimate] =
    useState<BuildingFootprintEstimateResponse | null>(null);
  const [isBuildingEstimateLoading, setIsBuildingEstimateLoading] = useState(false);
  const [buildingEstimateError, setBuildingEstimateError] = useState<string | null>(null);

  const features = result?.geojson.features ?? [];
  const addressPoint =
    selectedAddress !== null
      ? ([selectedAddress.longitude, selectedAddress.latitude] as Position)
      : mapClickPoint;
  const recommendedFeatureIndex = useMemo(
    () => findRecommendedFeatureIndex(features, addressPoint),
    [addressPoint, features],
  );
  const resolvedSelectedFeatureIndex =
    features[selectedFeatureIndex] !== undefined
      ? selectedFeatureIndex
      : recommendedFeatureIndex ?? 0;
  const selectedFeature = features[resolvedSelectedFeatureIndex] ?? null;
  const highlightedProperties = useMemo(
    () => getHighlightedProperties(selectedFeature),
    [selectedFeature],
  );
  const selectedFeatureArea = getFeatureAreaLabel(selectedFeature);
  const measuredArea = useMemo(
    () => computePolygonAreaSquareMeters(measurementPoints),
    [measurementPoints],
  );
  const estimatedBuildingFeature =
    buildingEstimate?.selected_index !== null && buildingEstimate?.selected_index !== undefined
      ? buildingEstimate.geojson.features[buildingEstimate.selected_index] ?? null
      : null;
  const estimatedBuildingArea = buildingEstimate?.estimated_area_sqm ?? null;
  const tracePointsForQuote =
    measurementPoints.length >= 3
      ? measurementPoints
      : estimatedBuildingFeature !== null
        ? getLargestPolygon(estimatedBuildingFeature.geometry)
        : [];
  const traceAreaForQuote = measuredArea ?? estimatedBuildingArea ?? null;

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



  useEffect(() => {
    if (addressPoint === null || result === null) {
      setBuildingEstimate(null);
      setBuildingEstimateError(null);
      setIsBuildingEstimateLoading(false);
      return;
    }

    let isCancelled = false;

    const loadBuildingEstimate = async () => {
      try {
        setIsBuildingEstimateLoading(true);
        setBuildingEstimateError(null);
        const response = await fetchBuildingFootprintEstimateRequest(
          addressPoint[0],
          addressPoint[1],
        );

        if (!isCancelled) {
          setBuildingEstimate(response);
        }
      } catch (error) {
        if (!isCancelled) {
          setBuildingEstimate(null);
          setBuildingEstimateError(extractErrorMessage(error));
        }
      } finally {
        if (!isCancelled) {
          setIsBuildingEstimateLoading(false);
        }
      }
    };

    void loadBuildingEstimate();

    return () => {
      isCancelled = true;
    };
  }, [addressPoint, result]);

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
      setSelectedFeatureIndex(
        findRecommendedFeatureIndex(response.geojson.features, activePoint) ?? 0,
      );
    } catch (error) {
      setResult(null);
      setErrorMessage(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
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

  const handleUseEstimatedBuildingFootprint = () => {
    if (estimatedBuildingFeature === null) {
      return;
    }

    const polygon = getLargestPolygon(estimatedBuildingFeature.geometry);
    if (polygon.length === 0) {
      return;
    }

    setMeasurementPoints(polygon);
    setIsMeasurementMode(false);
  };

  const handleSaveTraceForQuote = () => {
    if (result === null || tracePointsForQuote.length < 3) {
      return;
    }

    const selectedParcelPolygons =
      selectedFeature !== null ? geometryToPolygons(selectedFeature.geometry) : [];
    const estimatedBuildingPolygons =
      estimatedBuildingFeature !== null ? geometryToPolygons(estimatedBuildingFeature.geometry) : [];

    saveCadastreQuoteDraft({
      saved_at: new Date().toISOString(),
      address_label: selectedAddress?.label ?? null,
      address_point: addressPoint,
      search_kind: result.search_kind,
      source_url: result.source_url,
      parcel_title:
        selectedFeature !== null
          ? buildFeatureTitle(selectedFeature, resolvedSelectedFeatureIndex)
          : null,
      parcel_subtitle:
        selectedFeature !== null ? buildFeatureSubtitle(selectedFeature) : null,
      parcel_area_label: selectedFeatureArea,
      measured_area_sqm: measuredArea,
      estimated_building_area_sqm: estimatedBuildingArea,
      trace_area_sqm: traceAreaForQuote,
      trace_points: tracePointsForQuote,
      preview_svg: createCadastrePreviewSvg({
        parcelPolygons: selectedParcelPolygons,
        buildingPolygons: estimatedBuildingPolygons,
        tracePoints: tracePointsForQuote,
        addressPoint,
      }),
    });

    navigate('/app/quotes/new');
  };

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Box>
        <Typography variant="h2">Vue cadastrale</Typography>
        <Typography color="text.secondary">
          Identifiez precisement la parcelle a etudier avant de chiffrer la surface de toiture,
          facade ou emprise a traiter.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 5,
          border: '1px solid rgba(15, 23, 42, 0.08)',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
        }}
      >
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
          <Typography variant="h5">Recherche guidee</Typography>
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
                    ? 'Saisissez au moins 3 caracteres'
                    : 'Aucune suggestion'
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Adresse"
                    placeholder="10 rue de Rivoli, Paris"
                    helperText="Selectionnez une adresse pour retrouver automatiquement la parcelle la plus probable."
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
                label="Code departement"
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
                label="Numero parcelle"
                value={values.numero}
                onChange={handleChange('numero')}
                placeholder="12"
              />
            </Grid>
          </Grid>

          {selectedAddress ? (
            <Alert severity="info">
              Adresse retenue: {selectedAddress.label} ({selectedAddress.longitude.toFixed(5)},{' '}
              {selectedAddress.latitude.toFixed(5)}). Le point d'adresse est affiche sur la carte pour
              retrouver la bonne parcelle.
            </Alert>
          ) : null}

          {!selectedAddress && mapClickPoint ? (
            <Alert severity="info">
              Point manuel retenu sur la carte: {mapClickPoint[0].toFixed(5)}, {mapClickPoint[1].toFixed(5)}.
            </Alert>
          ) : null}

          {autocompleteError ? <Alert severity="warning">{autocompleteError}</Alert> : null}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
          >
            <Typography variant="body2" color="text.secondary">
              Sans section ni numero, une adresse selectionnee lance une recherche par point et met en
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
                borderRadius: 5,
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
                    <Typography variant="h5">Apercu cadastral interactif</Typography>
                    <Typography color="text.secondary">
                      {result.feature_count} entite{result.feature_count > 1 ? 's' : ''}{' '}
                      retournee{result.feature_count > 1 ? 's' : ''}. Cliquez sur une forme pour la
                      selectionner.
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
                      {isMapExpanded ? 'Retablir la mise en page' : 'Agrandir la carte'}
                    </Button>
                  </Stack>
                </Stack>
                <CadastreMap
                  geojson={result.geojson}
                  selectedIndex={resolvedSelectedFeatureIndex}
                  recommendedIndex={recommendedFeatureIndex}
                  addressPoint={addressPoint}
                  buildingEstimate={buildingEstimate}
                  isExpanded={isMapExpanded}
                  isMeasurementMode={isMeasurementMode}
                  measurementPoints={measurementPoints}
                  onSelect={setSelectedFeatureIndex}
                  onPickPoint={handleMapPick}
                  onAddMeasurementPoint={handleAddMeasurementPoint}
                  onToggleExpanded={() => setIsMapExpanded((current) => !current)}
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
                  borderRadius: 5,
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h5">Outil de mesure toiture</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Activez le mode dessin puis cliquez sur la carte pour entourer le toit ou la
                    zone a etudier. Une fois les points poses, vous pouvez les deplacer par
                    glisser-deposer pour affiner la surface.
                  </Typography>
                  {measuredArea !== null ? (
                    <Alert severity="success">
                      Surface dessinee: {formatSquareMeters(measuredArea)}
                    </Alert>
                  ) : (
                    <Alert severity="info">
                      Ajoutez au moins 3 points pour calculer une surface.
                    </Alert>
                  )}
                  {isBuildingEstimateLoading ? (
                    <Alert severity="info">Recherche automatique du bati autour du point...</Alert>
                  ) : null}
                  {buildingEstimateError ? (
                    <Alert severity="warning">{buildingEstimateError}</Alert>
                  ) : null}
                  {estimatedBuildingArea !== null ? (
                    <Alert severity="success">
                      Emprise bati detectee: {formatSquareMeters(estimatedBuildingArea)}.
                      Utilisez-la comme base puis ajustez le contour si besoin.
                    </Alert>
                  ) : null}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
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
                      variant="outlined"
                      onClick={handleUseEstimatedBuildingFootprint}
                      disabled={estimatedBuildingFeature === null}
                    >
                      Utiliser l'emprise bati
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSaveTraceForQuote}
                      disabled={tracePointsForQuote.length < 3 || traceAreaForQuote === null}
                    >
                      Enregistrer le trace
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleClearMeasurement}
                      disabled={measurementPoints.length === 0 && !isMeasurementMode}
                    >
                      Effacer le trace
                    </Button>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Points poses: {measurementPoints.length}
                  </Typography>
                  <Alert severity="info">
                    Conseil: utilisez le fond photo IGN pour caler les sommets sur les aretes du
                    toit, puis affinez le trace en glisser-deposer.
                  </Alert>
                </Stack>
              </Paper>

              {recommendedFeatureIndex !== null ? (
                <Alert severity="success">
                  Parcelle recommandee pour le devis: {buildFeatureTitle(
                    features[recommendedFeatureIndex],
                    recommendedFeatureIndex,
                  )}
                </Alert>
              ) : null}

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 5,
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h5">Entites</Typography>
                  <List
                    disablePadding
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid rgba(15, 23, 42, 0.08)',
                    }}
                  >
                    {features.map((feature, index) => {
                      const isRecommended = index === recommendedFeatureIndex;
                      const secondaryParts = [buildFeatureSubtitle(feature)];
                      if (isRecommended) {
                        secondaryParts.unshift('Logement cible probable');
                      }

                      return (
                        <ListItemButton
                          key={buildFeatureKey(feature, index)}
                          selected={index === resolvedSelectedFeatureIndex}
                          onClick={() => setSelectedFeatureIndex(index)}
                          divider={index < features.length - 1}
                        >
                          <ListItemText
                            primary={buildFeatureTitle(feature, index)}
                            secondary={secondaryParts.filter(Boolean).join(' · ')}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 5,
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h5">Selection courante</Typography>
                  {selectedFeatureArea ? (
                    <Alert severity="info">
                      Surface cadastrale indicative: {selectedFeatureArea}. A confirmer selon la zone
                      exacte a traiter sur le toit.
                    </Alert>
                  ) : null}
                  {highlightedProperties.length > 0 ? (
                    highlightedProperties.map(([key, value]) => (
                      <Stack
                        key={key}
                        direction="row"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Typography color="text.secondary">{formatPropertyLabel(key)}</Typography>
                        <Typography fontWeight={700}>{String(value)}</Typography>
                      </Stack>
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      Aucune propriete exploitable sur l'entite selectionnee.
                    </Typography>
                  )}
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 5,
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
  selectedIndex,
  recommendedIndex,
  addressPoint,
  buildingEstimate,
  isExpanded,
  isMeasurementMode,
  measurementPoints,
  onSelect,
  onPickPoint,
  onAddMeasurementPoint,
  onToggleExpanded,
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
    const buildingPolygons =
      buildingEstimate?.geojson.features.flatMap((feature) => geometryToPolygons(feature.geometry)) ?? [];

    geojson.features.forEach((feature, index) => {
      const isSelected = index === selectedIndex;
      const isRecommended = index === recommendedIndex;

      L.geoJSON(feature as GeoJsonFeature, {
        style: {
          color: isSelected ? '#1565c0' : isRecommended ? '#2e7d32' : '#32475b',
          weight: isSelected ? 3 : 2,
          fillOpacity: isSelected ? 0.32 : isRecommended ? 0.22 : 0.12,
          fillColor: isSelected ? '#1565c0' : isRecommended ? '#2e7d32' : '#1f2937',
        },
        onEachFeature: (_geoJsonFeature: GeoJsonFeature, layer: Layer) => {
          layer.on('click', () => onSelect(index));
        },
      }).addTo(parcelsLayer);
    });

    parcelsLayer.addTo(mapRef.current);
    parcelsLayerRef.current = parcelsLayer;

    if (buildingEstimate?.selected_index !== null && buildingEstimate?.selected_index !== undefined) {
      const estimatedBuildingFeature =
        buildingEstimate.geojson.features[buildingEstimate.selected_index] ?? null;

      if (estimatedBuildingFeature !== null) {
        L.geoJSON(estimatedBuildingFeature as GeoJsonFeature, {
          style: {
            color: '#ef6c00',
            weight: 2,
            dashArray: '8 6',
            fillColor: '#ffb300',
            fillOpacity: 0.08,
          },
        }).addTo(parcelsLayer);
      }
    }

    if (addressPoint) {
      pointLayerRef.current = L.circleMarker([addressPoint[1], addressPoint[0]], {
        radius: 7,
        color: '#ffffff',
        weight: 2,
        fillColor: '#d32f2f',
        fillOpacity: 1,
      }).addTo(mapRef.current);
    }

    if (measurementPoints.length > 0) {
      const measurementLayer = L.layerGroup();

      measurementPoints.forEach((point, index) => {
        const marker = L.marker([point[1], point[0]], {
          draggable: true,
          keyboard: false,
          icon: L.divIcon({
            className: 'cadastre-measure-marker',
            html:
              '<span style="display:block;width:14px;height:14px;border-radius:999px;background:#ef6c00;border:2px solid #ffffff;box-shadow:0 0 0 2px rgba(239,108,0,0.2);"></span>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
        });

        marker.on('drag', (event) => {
          const latLng = event.target.getLatLng();
          onUpdateMeasurementPoint(index, [latLng.lng, latLng.lat]);
        });

        marker.addTo(measurementLayer);
      });

      const latLngs = measurementPoints.map((point) => [point[1], point[0]] as [number, number]);

      if (measurementPoints.length >= 3) {
        L.polygon(latLngs, {
          color: '#ef6c00',
          weight: 2,
          fillColor: '#ffb300',
          fillOpacity: 0.18,
        }).addTo(measurementLayer);
      } else {
        L.polyline(latLngs, {
          color: '#ef6c00',
          weight: 2,
          dashArray: '6 6',
        }).addTo(measurementLayer);
      }

      measurementLayer.addTo(mapRef.current);
      measurementLayerRef.current = measurementLayer;
    }

    const geometryBounds = computeBounds([...boundsPoints, ...buildingPolygons.flat()]);
    const viewSignature = JSON.stringify({
      featureCount: geojson.features.length,
      geometryBounds,
      addressPoint,
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
      } else if (addressPoint) {
        mapRef.current.setView([addressPoint[1], addressPoint[0]], 19);
      }

      lastViewSignatureRef.current = viewSignature;
    }
  }, [
    addressPoint,
    buildingEstimate,
    geojson,
    isMeasurementMode,
    measurementPoints,
    onAddMeasurementPoint,
    onPickPoint,
    onSelect,
    onUpdateMeasurementPoint,
    recommendedIndex,
    selectedIndex,
  ]);

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 4,
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
            borderRadius: 999,
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

function flattenFeaturePolygons(features: CadastreFeature[]) {
  return features.flatMap((feature, featureIndex) =>
    geometryToPolygons(feature.geometry).map((polygon) => ({
      featureIndex,
      polygon,
    })),
  );
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

function polygonToPath(points: Position[]) {
  if (points.length === 0) {
    return '';
  }

  return points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${-y}`)
    .join(' ')
    .concat(' Z');
}

function getLargestPolygon(geometry: CadastreGeometry | null): Position[] {
  const polygons = geometryToPolygons(geometry).map(normalizePolygonPoints);

  return polygons.reduce<Position[]>((largest, polygon) => {
    const largestArea = computePolygonAreaSquareMeters(largest) ?? 0;
    const polygonArea = computePolygonAreaSquareMeters(polygon) ?? 0;
    return polygonArea > largestArea ? polygon : largest;
  }, []);
}

function normalizePolygonPoints(points: Position[]) {
  if (points.length > 1 && positionsEqual(points[0], points[points.length - 1])) {
    return points.slice(0, -1);
  }

  return points;
}

function positionsEqual(left: Position, right: Position) {
  return left[0] === right[0] && left[1] === right[1];
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
