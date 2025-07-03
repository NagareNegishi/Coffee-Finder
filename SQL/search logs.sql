CREATE TABLE search_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT NOW(),
    search_lat DOUBLE PRECISION NOT NULL,
    search_lon DOUBLE PRECISION NOT NULL,
    search_mode VARCHAR(20), -- 'current' or 'map'
    radius_km DECIMAL(2,1)
);