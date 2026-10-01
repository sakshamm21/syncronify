import axios from 'axios';

export interface PlaceSuggestion {
  id: string;
  place_name: string;
  /** [longitude, latitude] */
  center: [number, number];
}

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/** Place autocomplete via Mapbox. Returns [] when no token is configured or the lookup fails. */
export default async function getPlaces(query: string): Promise<PlaceSuggestion[]> {
  if (!TOKEN || !query.trim()) return [];
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
      { params: { access_token: TOKEN, limit: 5 } }
    );
    return response.data.features;
  } catch {
    return [];
  }
}
