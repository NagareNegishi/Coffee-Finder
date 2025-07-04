## Original Grid-based Collection Strategy
- Use 5km radius (within Overpass API limits)
- Create a grid of points covering New Zealand
- Loop through each point calling your existing functions

## Key considerations:

**Grid spacing:**
- 5km radius circles with ~7-8km spacing to avoid too much overlap
- Or 10km spacing for faster collection with some gaps

**Rate limiting:**
- Overpass API has limits (usually ~10-20 requests per minute)
- Add delays between requests: `await new Promise(resolve => setTimeout(resolve, 3000))`

**Error handling:**
- Some grid points might fail (ocean, remote areas)
- Continue the loop even if individual calls fail

**NZ boundaries:**
- Rough coordinates:
  - North: -34.4° to South: -47.3° (latitude)
  - West: 166.4° to East: 178.6° (longitude)

## Problem with this approach:
- Too many requests to Overpass API
- May hit rate limits or timeouts
- Not efficient for large datasets

## Alternative Approach:

Our data are coming from a Overpass API, so if it supports the query to get all coffee shops in New Zealand, we can use that instead of grid-based collection.

- Overpass API Language Guide: https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide
- Overpass API by Example: https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_API_by_Example
- Area queries: https://wiki.openstreetmap.org/wiki/Overpass_API/Areas
- ISO country codes: https://wiki.openstreetmap.org/wiki/Key:ISO3166-1

Example:
area["ISO3166-1"="DK"][admin_level=2];

- While we could use area["name"="New Zealand"], it is not as reliable as using the ISO code.
- The ISO code for New Zealand is "NZ".
- admin_level=2 is used for country-level queries.

So our query to get all coffee shops in New Zealand would look like this:

area["ISO3166-1"="NZ"][admin_level=2];


## JavaScript Code to Fetch All Coffee Shops in New Zealand

Run the following code directly in your JavaScript environment to fetch all coffee shops in New Zealand using the Overpass API.

```javascript
// Run the collection
const shops = await OSMService.fetchAllCoffeeShopsNZ(true);
console.log(`Found ${shops.length} coffee shops`);

// Save to database
await DatabaseService.saveCoffeeShopsToDatabase(shops);
console.log('Data saved to database');
```


## Export the Data as CSV

```sql
-- Export coffee shops data
SELECT
    id, name, latitude, longitude, address,
    opening_hours, phone, website, suburb, city,
    created_at, updated_at
FROM coffee_shops;

-- Export search logs
SELECT
    id, timestamp, search_lat, search_lon,
    search_mode, radius_km
FROM search_logs;
```

## Data Visualization

Use Tableau to visualize the coffee shop data