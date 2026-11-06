The Overpass API (formerly known as OSM Server Side Scripting, or OSM3S before 2011) is a read-only API that serves up custom selected parts of the OSM map data. It acts as a database over the web: the client sends a query to the API and gets back the data set that corresponds to the query.

## Objective
We will use the Overpass API to query OpenStreetMap (OSM) data for coffee shops in a specific area.
Then store them to my own database for further processing. (likely PostgreSQL)

### Main Documentation Sources
1. Overpass API Documentation 
   - Official Docs: [Overpass API Documentation](https://wiki.openstreetmap.org/wiki/Overpass_API)
   - Key Sections:
     - [Query Language](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL)
     - [Examples](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_API_by_Example)
     - [Elements Overview](https://wiki.openstreetmap.org/wiki/Elements)
     - [Node](https://wiki.openstreetmap.org/wiki/Node)
     - [Way](https://wiki.openstreetmap.org/wiki/Way)

2. OpenStreetMap Tagging System 
    - Main Tags Reference: [OSM Map Features](https://wiki.openstreetmap.org/wiki/Map_Features)
    - Specific Tags for Cafes:
      - [Amenity Tags](https://wiki.openstreetmap.org/wiki/Key:amenity)
      - [Cafe Details](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dcafe)

3. Address Format 
    - Address Tagging: https://wiki.openstreetmap.org/wiki/Key:addr


### Simplified Overview
There are two key element types in OSM:
- **Node**: Represents a single point in space defined by its latitude and longitude.
- **Way**: Represents a linear feature or area defined by a sequence of nodes.

So in my code, I will need 2 types of queries:
- **Node Query**:
{
    "type": "node",
    "id": 123456789,
    "lat": 35.6762,
    "lon": 139.6503,
    "tags": {
        ???????
        ???????
    }
}

- **Way Query**:
{
    "type": "way",
    "id": 987654321,
    "nodes": [123456789, 234567890, ...],
    "tags": {
        ???????
        ???????
    }
}


### what we need

At the first stage, we assumed that coffee shops are tagged with `amenity=cafe`.
We will handle other tags where might serve coffee, such as `amenity=restaurant` or `amenity=bar` in the future.

information required for each coffee shop:
- Name: `name`
- Address: `addr:street`, `addr:housenumber`, `addr:city`, `addr:postcode`
- Coordinates: `lat`, `lon`
- Opening Hours: `opening_hours`
- Phone Number: `phone`

additional information that might be useful:
- Website: `website`
- Email: `email`
- Rating: `rating`
- type of beans: `beans:type`

### Common Tags for Coffee Shops
{
    "amenity": "cafe",                    // Main category
    "name": "Coffee Shop Name",           // Business name
    "cuisine": "coffee_shop",             // Type of food/drink
    "opening_hours": "Mo-Fr 08:00-18:00", // When open
    "addr:housenumber": "123",            // Street number
    "addr:street": "Main Street",         // Street name
    "addr:city": "Tokyo",                 // City
    "addr:postcode": "12345",             // Postal code
    "phone": "+1-555-123-4567",           // Phone number
    "website": "https://example.com",     // Website
    "wheelchair": "yes",                  // Accessibility
    "wifi": "free",                       // WiFi availability
    "takeaway": "yes",                    // Takeout available
    "outdoor_seating": "yes"              // Has outdoor seating
}

### Our Query

- We want json format: [out:json]
- Timeout: 25 seconds for now: [timeout:25] 
(if we update the query regularly, we can set is longer)
- We have position, and want to search within a certain radius with format (around:radius,latitude,longitude): 
(around:${radius},${lat},${lng})
- Since we use both node and way, we could use center point for way: 
out center; 
it will return the center point of the way, which is useful for large areas.

**Final Query**

[out:json][timeout:25];
(
  node["amenity"="cafe"](around:${radius},${lat},${lng});
  way["amenity"="cafe"](around:${radius},${lat},${lng>);
)
out center;




