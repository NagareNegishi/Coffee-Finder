/**
* Replaced by `search logs` table.
*
* For future implementation:
* collect search history for analytics, which can help identify popular search areas
*/

CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    search_lat DECIMAL(10, 8),
    search_lon DECIMAL(11, 8),
    search_radius INTEGER,
    results_count INTEGER,
    search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT
);