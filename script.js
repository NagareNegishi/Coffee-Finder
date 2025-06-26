// supabase setup
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Parameters
let userLocation = null;
let coffeeShops = [];
let map = null;
let markers = [];

// Status message display
function showStatus(message, type = 'loading') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
}

// Hide status message
function hideStatus() {
    const statusDiv = document.getElementById('status');
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
 * First, it will check the database
 * if results are not enough or too old, it will fetch data from Overpass API.
 * Then, it will update the database with the new results.
 * @param {number} radius - The search radius in meters (default is 2000).
 * @param {number} minResults - The minimum number of results to return (default is 5).
 * @param {number} maxResults - The maximum number of results to return (default is  20).
 * @returns {Promise<void>} A promise that resolves when the search is complete.
 */
async function searchCoffeeShops(radius = 5000, minResults = 5, maxResults = 20) {
    try {
        showStatus('Searching for coffee shops...', 'loading');

        // first, try to get coffee shops from the database
        coffeeShops = await getCoffeeShopsFromDatabase(radius / 1000,  maxResults);
        coffeeShops = filterOldResults(coffeeShops, 14);

        // if we don't have enough results, or if the results are too old, fetch from Overpass API
        if (coffeeShops.length < minResults) {
            coffeeShops = await fetchFromOSM(radius);
            if (coffeeShops.length > 0) {
                const saveResult = await saveCoffeeShopsToDatabase(coffeeShops);
                if (saveResult.success) {
                    console.log('Coffee shops saved to database successfully');
                } else {
                    console.error('Failed to save coffee shops to database:', saveResult.error);
                }
            }
        }
        if (coffeeShops.length === 0) {
            showStatus('No coffee shops found nearby', 'warning');
            return;
        }

        // Then get the data from the database again, the results is sorted by distance
        coffeeShops = await getCoffeeShopsFromDatabase(radius / 1000, maxResults);
        displayCoffeeShops();
        addMarker();
        showStatus(`Found ${coffeeShops.length} coffee shops nearby`, 'success');
        
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        console.error('Search error:', error);
    }
}

/**
 * Filter out coffee shops that are older than a specified number of days.
 * @param {*} coffeeShops
 * @param {*} maxDays
 * @returns {Array} An array of coffee shops that are not older than the specified number of days.
 */
function filterOldResults(coffeeShops, maxDays = 14) {
    if (!coffeeShops || coffeeShops.length === 0) {
        return [];
    }
    const maxAge = maxDays * 24 * 60 * 60 * 1000; // convert days to milliseconds
    const now = Date.now();

    return coffeeShops.filter(shop => {
        const timestamp = shop.updated_at || shop.created_at; // use updated_at if available, otherwise created_at
        if (!timestamp) return false; // skip if no timestamp
        const age = now - new Date(timestamp);
        return age <= maxAge;
    });
}

/**
 * Fetch coffee shops from OpenStreetMap using Overpass API.
 * @param {*} radius
 * @returns {Promise<Array>} A promise that resolves with an array of coffee shops.
 */
async function fetchFromOSM(radius) {
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
    return parseOverpassData(data, userLocation);
}

/**
 * Display the list of coffee shops in the UI.
 */
function displayCoffeeShops() {
    const coffeeShopsDiv = document.getElementById('coffeeShops');
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
            ${shop.distance_km ? `<p><strong>Distance:</strong> <span class="distance">${formatDistance(shop.distance_km)}</span></p>` : ''}
            <p><strong>Status:</strong> ${getStatusDisplay(shop.openNow)}</p>
        `;
        coffeeShopsDiv.appendChild(shopElement);
    });
}

/**
 * Format the distance in meters or kilometers.
 * @param {*} km
 * @returns {string} A formatted string representing the distance in meters or kilometers.
 */
function formatDistance(km) {
    if (km < 1) {
        return `${(km * 1000).toFixed(0)} m`;
    } else {
        return `${km.toFixed(2)} km`;
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
 * Main function to find coffee shops.
 * This function will be called when the user clicks the "Find Coffee Shops" button.
 * It will handle the entire flow: getting user location, searching for coffee shops, and displaying results.
 * @returns {Promise<void>} A promise that resolves when the search is complete.
 */
async function findCoffeeShops() {
    const findBtn = document.getElementById('findCoffeeBtn');
    try {
        findBtn.disabled = true; // Prevent multiple clicks
        findBtn.textContent = 'Searching...';
        
        // Get user location
        await getLocation();
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

/**
 * Get the location based on the user's choice.
 * If the user chooses "Current Location", it will use the Geolocation API.
 * If the user chooses "Map Center", it will use the center of the map.
 */
async function getLocation(){
    const mode = document.querySelector('input[name="locationMode"]:checked').value;
    if (mode === 'current') {
        await getUserLocation();
    } else {
        const center = map.getCenter();
        userLocation = {
            lat: center.lat,
            lon: center.lng
        };
    }
}

/**
 * Add markers to the map for each coffee shop found.
 */
function addMarker(){
    if (coffeeShops.length === 0) return;

    // clear existing markers
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = []; // reset markers array

    // Add markers for each coffee shop
    coffeeShops.forEach(shop => {
        // first add marker to the map
        const marker = L.marker([shop.latitude, shop.longitude]).addTo(map);
        
        // then add the popup to the marker
        marker.bindPopup(`
            <strong>${shop.name}</strong><br>
            ${shop.address ? `<p>${shop.address}</p>` : ''}
            ${shop.opening_hours ? `<p>Opening Hours: ${shop.opening_hours}</p>` : ''}
            ${shop.phone ? `<p>Phone: ${shop.phone}</p>` : ''}
            ${shop.website ? `<p>Website: <a href="${shop.website}" target="_blank">${shop.website}</a></p>` : ''}
        `);
        markers.push(marker); // add marker to the markers array
    }
    );

    // If there are markers, fit the map bounds to show all markers
    // Since our search is radius based, we will not get markers that are too far away
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

/**
 *  Initialize the map with the center of London
 */
function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

// Initialize the map and set up event listeners when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map when the DOM is ready
    initMap();
    console.log('Map initialized');
    // Event listener for the "Find Coffee Shops" button
    const findBtn = document.getElementById('findCoffeeBtn');
    findBtn.addEventListener('click', findCoffeeShops);
    // Initial setup
    console.log('Coffee Finder initialized');
});







