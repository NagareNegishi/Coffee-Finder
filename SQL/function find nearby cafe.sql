/**
* Create function to find nearby cafes
*/
CREATE OR REPLACE FUNCTION find_nearby_cafe(
    -- Parameters for the search
    search_lat DOUBLE PRECISION,
    search_lon DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 2.0, -- Default radius of 2 km
    max_results INTEGER DEFAULT 10 -- Default limit of 10 results
) RETURNS TABLE (
    -- Return columns
    id INTEGER,
    osm_id BIGINT,
    osm_type VARCHAR,
    name VARCHAR,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    opening_hours TEXT,
    phone VARCHAR,
    website VARCHAR,
    suburb VARCHAR,
    city VARCHAR,
    distance_km DOUBLE PRECISION
) AS $$ -- Function body start
BEGIN
    RETURN QUERY
    SELECT
        cs.id,
        cs.osm_id,
        cs.osm_type,
        cs.name,
        cs.latitude,
        cs.longitude,
        cs.address,
        cs.opening_hours,
        cs.phone,
        cs.website,
        cs.suburb,
        cs.city,
        -- Calculate the distance in kilometers using Haversine formula
        -- Haversine formula: calculates great-circle distance between two points on Earth
        -- Formula: R * acos(cos(lat1) * cos(lat2) * cos(lon2-lon1) + sin(lat1) * sin(lat2))
        -- Where R = Earth's radius (6371 km), all coordinates must be in radians
        (6371 * acos(
            cos(radians(search_lat)) * cos(radians(cs.latitude)) *
            cos(radians(cs.longitude) - radians(search_lon)) +
            sin(radians(search_lat)) * sin(radians(cs.latitude))
        )) AS distance_km
    FROM coffee_shops cs
    WHERE
        -- Filter cafes within the specified radius
        (6371 * acos(
            cos(radians(search_lat)) * cos(radians(cs.latitude)) *
            cos(radians(cs.longitude) - radians(search_lon)) +
            sin(radians(search_lat)) * sin(radians(cs.latitude))
        )) <= radius_km
    ORDER BY distance_km
    LIMIT max_results;
END;
$$ -- Function body end
LANGUAGE plpgsql; -- Specify the language as PL/pgSQL.