import type { Position } from '../types/cadastre.types';

export type CadastreQuoteDraft = {
  saved_at: string;
  address_label: string | null;
  address_point: Position | null;
  search_kind: 'commune' | 'parcelle';
  source_url: string;
  parcel_title: string | null;
  parcel_subtitle: string | null;
  parcel_area_label: string | null;
  measured_area_sqm: number | null;
  trace_area_sqm: number | null;
  trace_points: Position[];
  preview_svg: string | null;
};

const STORAGE_KEY = 'cartotrac.cadastre.quoteDraft';

export function saveCadastreQuoteDraft(draft: CadastreQuoteDraft) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function loadCadastreQuoteDraft() {
  const rawValue = window.sessionStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as CadastreQuoteDraft;
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearCadastreQuoteDraft() {
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function createCadastrePreviewSvg(options: {
  parcelPolygons: Position[][];
  tracePoints: Position[];
  addressPoint: Position | null;
}) {
  const width = 320;
  const height = 220;
  const padding = 18;
  const tracePolygons = options.tracePoints.length >= 3 ? [options.tracePoints] : [];
  const allPoints = [
    ...options.parcelPolygons.flat(),
    ...options.tracePoints,
    ...(options.addressPoint ? [options.addressPoint] : []),
  ];

  if (allPoints.length === 0) {
    return null;
  }

  const bounds = allPoints.reduce(
    (current, [x, y]) => ({
      minX: Math.min(current.minX, x),
      minY: Math.min(current.minY, y),
      maxX: Math.max(current.maxX, x),
      maxY: Math.max(current.maxY, y),
    }),
    {
      minX: allPoints[0][0],
      minY: allPoints[0][1],
      maxX: allPoints[0][0],
      maxY: allPoints[0][1],
    },
  );

  const scaleX = (width - padding * 2) / Math.max(bounds.maxX - bounds.minX, 0.000001);
  const scaleY = (height - padding * 2) / Math.max(bounds.maxY - bounds.minY, 0.000001);
  const scale = Math.min(scaleX, scaleY);

  const project = ([x, y]: Position) => {
    const px = padding + (x - bounds.minX) * scale;
    const py = height - padding - (y - bounds.minY) * scale;
    return [px, py] as const;
  };

  const polygonToPath = (points: Position[]) => {
    if (points.length === 0) {
      return '';
    }

    return points
      .map((point, index) => {
        const [px, py] = project(point);
        return `${index === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`;
      })
      .join(' ')
      .concat(' Z');
  };

  const lineToPath = (points: Position[]) =>
    points
      .map((point, index) => {
        const [px, py] = project(point);
        return `${index === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`;
      })
      .join(' ');

  const parcelPaths = options.parcelPolygons
    .map((polygon) => `<path d="${polygonToPath(polygon)}" fill="rgba(21,101,192,0.14)" stroke="#1565c0" stroke-width="2" />`)
    .join('');

  const tracePath =
    tracePolygons.length > 0
      ? `<path d="${polygonToPath(tracePolygons[0])}" fill="rgba(239,108,0,0.18)" stroke="#ef6c00" stroke-width="3" />`
      : options.tracePoints.length > 1
        ? `<path d="${lineToPath(options.tracePoints)}" fill="none" stroke="#ef6c00" stroke-width="3" stroke-dasharray="6 6" />`
        : '';

  const traceMarkers = options.tracePoints
    .map((point) => {
      const [px, py] = project(point);
      return `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="4.5" fill="#ef6c00" stroke="#ffffff" stroke-width="2" />`;
    })
    .join('');

  const addressMarker = options.addressPoint
    ? (() => {
        const [px, py] = project(options.addressPoint as Position);
        return `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="5" fill="#d32f2f" stroke="#ffffff" stroke-width="2" />`;
      })()
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><rect width="100%" height="100%" rx="18" fill="#f8fafc" />${parcelPaths}${tracePath}${traceMarkers}${addressMarker}</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
