/**
 * Place search for venues, backed by OpenStreetMap Nominatim (free, no key).
 * Requests go through the API so we can send the identifying User-Agent and
 * cache results, as the Nominatim usage policy asks.
 */
const env = require('../../config/env');
const logger = require('../../lib/logger');
const { AppError } = require('../../lib/errors');

const ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const CACHE_LIMIT = 500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map();

function fromCache(key) {
  const hit = cache.get(key);
  if (!hit || hit.expires < Date.now()) return null;
  return hit.places;
}

function remember(key, places) {
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
  cache.set(key, { places, expires: Date.now() + CACHE_TTL_MS });
}

async function search(query, { limit = 5 } = {}) {
  const key = `${query.toLowerCase()}|${limit}`;
  const cached = fromCache(key);
  if (cached) return cached;

  const url = `${ENDPOINT}?${new URLSearchParams({ q: query, format: 'jsonv2', limit: String(limit) })}`;
  let response;
  try {
    response = await fetch(url, {
      headers: { 'User-Agent': `Syncronify/2.0 (${env.clientUrl})`, 'Accept-Language': 'en' },
      signal: AbortSignal.timeout(6000),
    });
  } catch (err) {
    logger.warn({ err: err.message }, 'Place search unavailable');
    throw new AppError(503, 'Place search is unavailable right now. You can still type the venue name.', 'PLACES_UNAVAILABLE');
  }
  if (!response.ok) {
    throw new AppError(503, 'Place search is unavailable right now. You can still type the venue name.', 'PLACES_UNAVAILABLE');
  }

  const results = await response.json();
  const places = results.map((r) => ({
    id: String(r.place_id),
    name: r.name || r.display_name.split(',')[0],
    address: r.display_name,
    latitude: Number(r.lat),
    longitude: Number(r.lon),
  }));
  remember(key, places);
  return places;
}

module.exports = { search };
