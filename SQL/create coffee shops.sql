/**
* Coffee Shops Table Creation Script
*/

CREATE TABLE coffee_shops (
    id SERIAL PRIMARY KEY,
    osm_id BIGINT NOT NULL, -- identifier for OpenStreetMap, maximum digits for way is 15, so int is insufficient
    osm_type VARCHAR(10) NOT NULL, -- only expect 'node' and 'way', so can be shorter
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL, -- 2 + 8 is maximum for latitude
    longitude DOUBLE PRECISION NOT NULL, -- 3 + 8 is maximum for longitude
    address TEXT,
    opening_hours TEXT,
    phone VARCHAR(50), -- initially set to 20, but increased it to 50 as some phone numbers can be longer
    website VARCHAR(255),
    suburb VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(osm_type, osm_id) -- According to OpenStreetMap, combination of osm_type and osm_id is unique
);

-- Indexes to improve search performance
CREATE INDEX idx_coffee_shops_location ON coffee_shops (latitude, longitude);
CREATE INDEX idx_coffee_shops_city ON coffee_shops (city);
CREATE INDEX idx_coffee_shops_suburb ON coffee_shops (suburb);
CREATE INDEX idx_coffee_shops_osm ON coffee_shops (osm_type, osm_id);

