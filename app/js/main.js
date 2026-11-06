// js/main.js
import { DatabaseService } from './services/databaseService.js';
import { LocationService } from './services/locationService.js';
import { MapService } from './services/mapService.js';
import { OpeningHoursService } from './services/OpeningHoursService.js';
import { OSMService } from './services/osmService.js';
import { UIService } from './services/uiService.js';

let userLocation = null;
let coffeeShops = [];

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
async function searchCoffeeShops(radius = 2000, minResults = 5, maxResults = 20) {
    try {
        UIService.showStatus('Searching for coffee shops...', 'loading');
        MapService.showSearchLoading(); // Show loading overlay while searching

        // first, try to get coffee shops from the database
        coffeeShops = await DatabaseService.getCoffeeShopsFromDatabase(userLocation, radius / 1000,  maxResults);
        coffeeShops = DatabaseService.filterOldResults(coffeeShops, 14);

        // if we don't have enough results, or if the results are too old, fetch from Overpass API
        if (coffeeShops.length < minResults) {
            coffeeShops = await OSMService.fetchFromOSM(radius, userLocation);
            if (coffeeShops.length > 0) {
                const saveResult = await DatabaseService.saveCoffeeShopsToDatabase(coffeeShops);
                if (saveResult.success) {
                    console.log('Coffee shops saved to database successfully');
                } else {
                    console.error('Failed to save coffee shops to database:', saveResult.error);
                }
            }
        }
        if (coffeeShops.length === 0) {
            UIService.showStatus('No coffee shops found nearby', 'warning');
            return;
        }

        // Then get the data from the database again, the results is sorted by distance
        coffeeShops = await DatabaseService.getCoffeeShopsFromDatabase(userLocation, radius / 1000, maxResults);
        coffeeShops = OpeningHoursService.addOpenNow(coffeeShops); // Add open now status to each coffee shop
        if (UIService.getSettings().openingFilter === 'now') {
            coffeeShops = OpeningHoursService.filterOpenNow(coffeeShops, true);
        }
        UIService.displayCoffeeShops(coffeeShops);
        MapService.addMarker(coffeeShops);
        UIService.showStatus(`Found ${coffeeShops.length} coffee shops nearby`, 'success');
        
    } catch (error) {
        UIService.showStatus(`Error: ${error.message}`, 'error');
        console.error('Search error:', error);
    } finally {
        MapService.hideSearchLoading(); // Hide loading overlay after searching
    }
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
        userLocation = await LocationService.getLocation(MapService.map);
        UIService.showStatus(`Location found: ${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}`, 'success');
        
        // Search for coffee shops
        const settings = UIService.getSettings();
        await searchCoffeeShops(settings.radius, 5, settings.maxResults);
        // Log the search to the database, but do not await it
        const mode = document.querySelector('input[name="locationMode"]:checked').value;
        DatabaseService.logSearch(userLocation, mode, settings.radius / 1000)
        
    } catch (error) {
        UIService.showStatus(`Error: ${error.message}`, 'error');
        console.error('Find coffee shops error:', error);
    } finally {
        findBtn.disabled = false;
        findBtn.textContent = 'Find Coffee Shops';
    }
}

/**
 * Switch the location mode based on user selection.
 * If no permission is granted for the current location,
 * it will switch to the map mode.
 */
async function switchLocationMode() {
    UIService.hideStatus();
    const mode = document.querySelector('input[name="locationMode"]:checked').value;
    if (mode === 'current') {
        const result = await LocationService.requestLocation();
        if (result.success) {
            userLocation = result.location;
            MapService.updateMapCenter(userLocation);
        } else {
            const mapMode = document.querySelector('input[name="locationMode"][value="map"]');
            if (mapMode) {
                mapMode.checked = true;
            }
            UIService.showStatus('Current location access denied, switching to map mode', 'error');
        }
    }
}

// Initialize the map and set up event listeners when the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the map when the DOM is ready
    MapService.initMap();
    console.log('Map initialized');

    await switchLocationMode();

    // Event listeners
    document.getElementById('findCoffeeBtn').addEventListener('click', findCoffeeShops);
    document.getElementById('hamburgerButton').addEventListener('click', UIService.toggleSettingsPanel);
    document.getElementById('radiusSlider').addEventListener('input', UIService.updateRadius);
    document.getElementById('openingFilter').addEventListener('change', UIService.updateOpeningFilter);
    document.getElementById('maxResults').addEventListener('change', UIService.updateMaxResults);
    document.querySelectorAll('input[name="locationMode"]').forEach(radio => {
        radio.addEventListener('change', switchLocationMode);
    });

    // Initial setup
    console.log('Coffee Finder initialized');
});
