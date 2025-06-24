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

// // Mock function to simulate fetching coffee shops data
// // In a real application, this would call the Google Places API or similar service
// function getMockCoffeeShops() {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             const mockShops = [
//                 {
//                     name: "Starbucks Coffee",
//                     address: "123 Main Street",
//                     rating: 4.2,
//                     distance: "0.3 km",
//                     openNow: true
//                 },
//                 {
//                     name: "Local Coffee House",
//                     address: "456 Oak Avenue",
//                     rating: 4.7,
//                     distance: "0.5 km",
//                     openNow: true
//                 },
//                 {
//                     name: "Café Mocha",
//                     address: "789 Pine Street",
//                     rating: 4.0,
//                     distance: "0.8 km",
//                     openNow: false
//                 }
//             ];
//             resolve(mockShops);
//         }, 1000);
//     });
// }






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
        const address = tags.address || 'No address provided'; // for now
        const openingHours = tags.opening_hours || null;

        // Additional information
        const phone = tags.phone || tags.mobile || null;
        const website = tags.website || null;

        return {
            name: name,
            lat: lat,
            lon: lon,
            address: address,
            openingHours: openingHours,
            phone: phone,
            website: website,
            id: element.id,
            type: element.type
        };
    }).filter(shop => shop !== null); // Filter out any null entries
    console.log('Parsed coffee shops:', coffeeShops);
    return coffeeShops;
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


        // mock data for now!!!!
        //coffeeShops = await getMockCoffeeShops();
        
        displayCoffeeShops();
        showStatus(`Found ${coffeeShops.length} coffee shops nearby`, 'success');
        
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        console.error('Search error:', error);
    }
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
            <p><strong>Address:</strong> ${shop.address}</p>
            <p><strong>Rating:</strong> <span class="rating">${shop.rating}/5 ⭐</span></p>
            <p><strong>Distance:</strong> <span class="distance">${shop.distance}</span></p>
            <p><strong>Status:</strong> ${shop.openNow ? '🟢 Open Now' : '🔴 Closed'}</p>
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