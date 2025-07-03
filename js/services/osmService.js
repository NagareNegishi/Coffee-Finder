export class OSMService {

    /**
     * Passe the address tags from OpenStreetMap and build a formatted address string.
     * @param {Object} tags - The tags may contain address information.
     * @returns {string|null} A formatted address string or null if no address information is available
     */
    static buildAddress(tags){
        if (!tags) return null;

        const addressParts = [];

        // Street address
        if (tags['addr:housenumber'] && tags['addr:street']) {
            addressParts.push(`${tags['addr:housenumber']} ${tags['addr:street']}`);
        } else if (tags['addr:street']) {
            addressParts.push(tags['addr:street']);
        }

        if (tags['addr:suburb']) {
            addressParts.push(tags['addr:suburb']);
        }
        if (tags['addr:city']) {
            addressParts.push(tags['addr:city']);
        }

        return addressParts.length > 0 ? addressParts.join(', ') : null;
    }

    /**
     * Parse the Overpass API response and extract coffee shop data.
     * @param {Object} overpassData - The Overpass API response data.
     * @returns {Array} An array of coffee shop objects.
     */
    static parseOverpassData(overpassData) {
        if (!overpassData.elements || overpassData.elements.length === 0) {
            console.warn('No coffee shops found in the Overpass API response');
            return [];
        }

        const coffeeShops = overpassData.elements.map(element => {
            // Location coordinates
            let lat, lon;
            if (element.type === 'node') {
                lat = element.lat;
                lon = element.lon;
            } else if (element.center) { // way
                lat = element.center.lat;
                lon = element.center.lon;
            } else {
                console.warn('Way without center found, skipping: ', element);
                return null;
            }

            // Basic information
            const tags = element.tags || {};
            const name = tags.name || 'Unnamed Venue';
            const address = OSMService.buildAddress(tags);
            const openingHours = tags.opening_hours || null;

            // Additional information
            const phone = tags.phone || tags.mobile || null;
            const website = tags.website || null;
            const suburb = tags['addr:suburb'] || null;
            const city = tags['addr:city'] || null;

            return { // use the same format as the database schema
                osm_id: element.id, // OpenStreetMap ID
                osm_type: element.type, // 'node' or 'way'
                name: name,
                latitude: lat,
                longitude: lon,
                address: address,
                opening_hours: openingHours,
                phone: phone,
                website: website,
                suburb: suburb,
                city: city,
            };
        }).filter(shop => shop !== null); // Filter out any null entries
        console.log('Parsed coffee shops:', coffeeShops);
        return coffeeShops;
    }

    /**
     * Fetch coffee shops from OpenStreetMap using Overpass API.
     * @param {*} radius
     * @param {Object} userLocation - The user's current location
     * @returns {Promise<Array>} A promise that resolves with an array of coffee shops.
     */
    static async fetchFromOSM(radius, userLocation) {
        // Overpass Query, reference: OpenStreetMap Data Format.md
        const overpassQuery = `
            [out:json][timeout:25];
            (
                node["amenity"="cafe"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
                way["amenity"="cafe"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
                node["shop"="coffee"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
                way["shop"="coffee"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
                node["cuisine"="coffee_shop"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
                way["cuisine"="coffee_shop"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
            );
            out center;
        `;
    
        // Fetch data from Overpass API
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: overpassQuery
        });
    
        if (!response.ok) {
            throw new Error(`Overpass API request failed with status ${response.status}`);
        }
        const data = await response.json();
    
        console.log('Overpass API response:', data);
    
        // Parse the data from Overpass API
        return OSMService.parseOverpassData(data);
    }


    /**
     * DO NOT USE THIS FUNCTION IN PRODUCTION!!!
     *
     * Fetch all coffee shops in New Zealand using Overpass API.
     * This is special function for data collection.
     */
    static async fetchAllCoffeeShopsNZ(forceRun = false) {
        if (!forceRun) {
            throw new Error('Do not call this function without permission!');
        }
        const overpassQuery = `
            [out:json][timeout:60];
            (
                area["ISO3166-1"="NZ"][admin_level=2];
                (
                    node["amenity"="cafe"](area);
                    way["amenity"="cafe"](area);
                    node["shop"="coffee"](area);
                    way["shop"="coffee"](area);
                    node["cuisine"="coffee_shop"](area);
                    way["cuisine"="coffee_shop"](area);
                );
            );
            out center;
        `;
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: overpassQuery
        });
    
        const data = await response.json();
        return OSMService.parseOverpassData(data);
    }

}