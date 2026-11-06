/**
 * Runs one nearby-cafe search with a random position and radius against Supabase.
 * Used by search-activity.yml to keep the free tier project active.
 *
 * Env: SUPABASE_URL, SUPABASE_KEY (anon key), RANDOMIZE_RESULTS ('true' = random
 * max_results; any other value uses MAX_RESULTS).
 */
const { createClient } = require('@supabase/supabase-js');

// Mirrors CONFIG.search.maxResults in app/js/config.js
const MAX_RESULTS = 20;
const MIN_RESULTS = 5;
const MAX_RADIUS_KM = 5;
const MIN_RADIUS_KM = 1;
const JITTER_DEG = 0.02; // about 2 km, so repeated picks of one city differ

const CITIES = [
  { name: 'Tokyo', lat: 35.6812, lon: 139.7671 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Melbourne', lat: -37.8136, lon: 144.9631 },
  { name: 'Seattle', lat: 47.6062, lon: -122.3321 },
  { name: 'Seoul', lat: 37.5665, lon: 126.978 }
];

/** @returns {number} Random float in [min, max). */
const randomBetween = (min, max) => min + Math.random() * (max - min);

/** @returns {number} Random integer in [min, max]. */
const randomInt = (min, max) => Math.floor(randomBetween(min, max + 1));

/** @returns {{name: string, lat: number, lon: number}} A random city with a small offset. */
function pickPosition() {
  const city = CITIES[randomInt(0, CITIES.length - 1)];
  return {
    name: city.name,
    lat: city.lat + randomBetween(-JITTER_DEG, JITTER_DEG),
    lon: city.lon + randomBetween(-JITTER_DEG, JITTER_DEG)
  };
}

/** @returns {number} Radius in km, rounded to 0.5 steps. */
function pickRadius() {
  return Math.round(randomBetween(MIN_RADIUS_KM, MAX_RADIUS_KM) * 2) / 2;
}

/** @returns {number} MAX_RESULTS unless RANDOMIZE_RESULTS is 'true'. */
function pickMaxResults() {
  return process.env.RANDOMIZE_RESULTS === 'true'
    ? randomInt(MIN_RESULTS, MAX_RESULTS)
    : MAX_RESULTS;
}

(async () => {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const position = pickPosition();
  const radius = pickRadius();
  const maxResults = pickMaxResults();

  console.log(
    `Searching near ${position.name} (${position.lat.toFixed(4)}, ${position.lon.toFixed(4)}), ` +
    `radius ${radius} km, max ${maxResults}`
  );

  try {
    const { data, error } = await supabase.rpc('find_nearby_cafe', {
      search_lat: position.lat,
      search_lon: position.lon,
      radius_km: radius,
      max_results: maxResults
    });

    if (error) {
      console.error('Search failed:', error.message);
      process.exit(1);
    }

    console.log('Search successful - returned ' + (data ? data.length : 0) + ' row(s)');
  } catch (err) {
    console.error('Unexpected error:', err.message);
    process.exit(1);
  }
})();
