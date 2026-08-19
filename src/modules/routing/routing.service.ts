import createError from 'http-errors';
import type { CyclingRouteRequest } from './types/routing.request.types.ts';
import type { CyclingRouteResponse } from './types/routing.response.types.ts';

type OpenRouteResponse = {
  features: Array<{
    geometry: { coordinates: [number, number][] };
    properties: {
      summary: { distance: number; duration: number };
      segments: Array<{ steps: Array<{ instruction: string; name: string; distance: number; duration: number }> }>;
    };
  }>;
};

export async function getCyclingRoute({ start, end }: CyclingRouteRequest): Promise<CyclingRouteResponse> {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  if (!apiKey) throw createError(503, 'OpenRouteService API key is missing');

  const request = {
    method: 'POST',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // OpenRouteService expects [longitude, latitude].
      coordinates: [
        [start.longitude, start.latitude],
        [end.longitude, end.latitude],
      ],
      language: 'he',
      instructions: true,
    }),
  };

  const response = await fetchRoute(request);

  if (!response.ok) {
    console.error('OpenRouteService error:', response.status, await response.text());
    throw createError(response.status, 'Could not calculate a cycling route');
  }

  const data = (await response.json()) as OpenRouteResponse;
  const route = data.features[0];
  if (!route) throw createError(404, 'Cycling route not found');

  return {
    coordinates: route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude] as [number, number]),
    distanceMeters: route.properties.summary.distance,
    durationSeconds: route.properties.summary.duration,
    steps: route.properties.segments.flatMap((segment) => segment.steps),
  };
}

async function fetchRoute(request: RequestInit) {
  try {
    return await fetch('https://api.heigit.org/openrouteservice/v2/directions/cycling-regular/geojson', request);
  } catch {
    // Retry one transient DNS/network failure before reporting service unavailability.
    try {
      return await fetch('https://api.heigit.org/openrouteservice/v2/directions/cycling-regular/geojson', request);
    } catch {
      throw createError(503, 'Routing service is temporarily unavailable');
    }
  }
}
