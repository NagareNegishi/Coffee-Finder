// supabase setup
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

let userLocation = null;
let coffeeShops = [];

// DOM element
const findBtn = document.getElementById('findCoffeeBtn');
const statusDiv = document.getElementById('status');
const coffeeShopsDiv = document.getElementById('coffeeShops');

// Status message display
function showStatus(message, type = 'loading') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
}

// Hide status message
function hideStatus() {
    statusDiv.style.display = 'none';
}

/**
 * Ge5t the user's current location using the Geolocation API.
 * @returns {Promise<Object>} A promise that resolves with the user's location (latitude and longitude).
 * @throws {Error} If geolocation is not supported or if there is an error retrieving
 */
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }
        
        showStatus('Getting your location...', 'loading');
        
        // try to get the user's current position
        navigator.geolocation.getCurrentPosition(
            // Case success
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                resolve(userLocation);
            },
            // Case error
            (error) => {
                let errorMessage = 'Unable to get your location';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                }
                reject(new Error(errorMessage));
            },
            // Options for geolocation
            {
                enableHighAccuracy: true, // need high accuracy for better results
                timeout: 10000, // user will not wait more than 10 seconds
                maximumAge: 300000 // lets assume user's location does not change drastically in 5 minutes
            }
        );
    });
}

/**
 * Passe the address tags from OpenStreetMap and build a formatted address string.
 * @param {Object} tags - The tags may contain address information.
 * @returns {string|null} A formatted address string or null if no address information is available
 */
function buildAddress(tags){
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
 * @param {Object} userLocation - The user's current location (latitude and longitude).
 * @returns {Array} An array of coffee shop objects.
 */
function parseOverpassData(overpassData, userLocation) {
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
        const address = buildAddress(tags);
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
 * Save coffee shops to the database using Supabase.
 * @param {*} coffeeShops
 * @returns  {Promise<{success: boolean, data?: Array, error?: string}>}
 */
async function saveCoffeeShopsToDatabase(coffeeShops) {
    if (!coffeeShops || coffeeShops.length === 0) {
        console.warn('No coffee shops to save to the database');
        return;
    }
    try {
        const { data, error } = await supabase
            .from('coffee_shops')
            // upsert: Insert new records or update existing ones based on the primary key
            .upsert(coffeeShops, {
                onConflict: 'osm_type, osm_id', // Use osm_id and osm_type as the conflict target
                ignoreDuplicates: false // update existing records
            })
            .select();

        if (error) {
            console.error('Error saving coffee shops to database:', error);
            throw error;
        }
        console.log(data.length, ' Coffee shops saved to database');
        return { success: true, data: data };
    } catch (error) {
        console.error('Error saving coffee shops to database:', error);
        return { success: false, error: error.message };
    }
}



/**
 * Get coffee shops from the database using Supabase.
 * @param {*} radius
 * @param {*} max_results
 * @returns {Promise<Array>} A promise that resolves with an array of coffee shops.
 * @throws {Error} If there is an error fetching data from the database.
 */
async function getCoffeeShopsFromDatabase(radius = 2.0, max_results = 10) {
    try {
        const { data, error } = await supabase
            .rpc('find_nearby_cafe', {
                search_lat: userLocation.lat,
                search_lon: userLocation.lon,
                radius_km: radius,
                max_results: max_results
            });
        if (error) {
            console.error('Error fetching coffee shops from database:', error);
            throw error;
        }
        return data;
    }  catch (error) {
        console.error('Error fetching coffee shops from database:', error);
        return [];
    }
}







/**
 * Search for coffee shops near the user's location.
 * @returns {Promise<void>} A promise that resolves when the search is complete.
 */
async function searchCoffeeShops(radius = 500) {
    try {
        showStatus('Searching for coffee shops...', 'loading');
        
        // Overpass Query, reference: OpenStreetMap Data Format.md
        const overpassQuery = `
            [out:json][timeout:25];
            (
                node["amenity"="cafe"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
                way["amenity"="cafe"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
                // node["shop"="coffee"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
                // way["shop"="coffee"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
                // node["cuisine"="coffee_shop"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
                // way["cuisine"="coffee_shop"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
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

        // Parse the data from Overpass API
        coffeeShops = parseOverpassData(data, userLocation);

        const saveResult = await saveCoffeeShopsToDatabase(coffeeShops);
        if (saveResult.success) {
            console.log('Coffee shops saved to database successfully');
        } else {
            console.error('Failed to save coffee shops to database:', saveResult.error);
        }

        coffeeShops = await getCoffeeShopsFromDatabase(radius / 1000, 10);
        if (coffeeShops.length === 0) {
            showStatus('No coffee shops found nearby', 'warning');
            return;
        }
        
        displayCoffeeShops();
        showStatus(`Found ${coffeeShops.length} coffee shops nearby`, 'success');
        
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        console.error('Search error:', error);
    }
}


/**
 * Helper function to get the display status of a coffee shop based on its openNow property.
 * @param {*} openNow
 * @returns {string} A string representing the status of the coffee shop.
 */
function getStatusDisplay(openNow) {
    if (openNow === true) return '🟢 Open Now';
    if (openNow === false) return '🔴 Closed';
    return '🟡 Unknown';
}


/**
 * Display the list of coffee shops in the UI.
 */
function displayCoffeeShops() {
    coffeeShopsDiv.innerHTML = '';
    
    coffeeShops.forEach(shop => {
        const shopElement = document.createElement('div');
        shopElement.className = 'coffee-shop';
        
        shopElement.innerHTML = `
            <h3>${shop.name}</h3>
            ${shop.address ? `<p><strong>Address:</strong> ${shop.address}</p>` : ''}
            ${shop.openingHours ? `<p><strong>Opening Hours:</strong> ${shop.openingHours}</p>` : ''}
            ${shop.phone ? `<p><strong>Phone:</strong> ${shop.phone}</p>` : ''}
            ${shop.website ? `<p><strong>Website:</strong> <a href="${shop.website}" target="_blank">${shop.website}</a></p>` : ''}
            ${shop.rating ? `<p><strong>Rating:</strong> <span class="rating">${shop.rating}/5 ⭐</span></p>` : ''}
            ${shop.distance ? `<p><strong>Distance:</strong> <span class="distance">${shop.distance}</span></p>` : ''}
            <p><strong>Status:</strong> ${getStatusDisplay(shop.openNow)}</p>
        `;
        coffeeShopsDiv.appendChild(shopElement);
    });
}

/**
 * Main function to find coffee shops.
 * This function will be called when the user clicks the "Find Coffee Shops" button.
 * It will handle the entire flow: getting user location, searching for coffee shops, and displaying results.
 * @returns {Promise<void>} A promise that resolves when the search is complete.
 */
async function findCoffeeShops() {
    try {
        findBtn.disabled = true; // Prevent multiple clicks
        findBtn.textContent = 'Searching...';
        
        // Get user location
        await getUserLocation();
        showStatus(`Location found: ${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}`, 'success');
        
        // Search for coffee shops
        await searchCoffeeShops();
        
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        console.error('Find coffee shops error:', error);
    } finally {
        findBtn.disabled = false;
        findBtn.textContent = 'Find Coffee Shops';
    }
}

// Event listener for the "Find Coffee Shops" button
findBtn.addEventListener('click', findCoffeeShops);

// Initial setup
console.log('Coffee Finder initialized');
console.log('Click "Find Coffee Shops" to start searching');