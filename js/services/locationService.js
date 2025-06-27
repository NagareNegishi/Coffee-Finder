import { CONFIG } from '../config.js';


export class LocationService {

    /**
     * Ge5t the user's current location using the Geolocation API.
     * @returns {Promise<Object>} A promise that resolves with the user's location (latitude and longitude).
     * @throws {Error} If geolocation is not supported or if there is an error retrieving
     */
    static getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }
            
            // try to get the user's current position
            navigator.geolocation.getCurrentPosition(
                // Case success
                (position) => {
                    const userLocation = {
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
                    enableHighAccuracy: CONFIG.geolocation.enableHighAccuracy,
                    timeout: CONFIG.geolocation.timeout,
                    maximumAge: CONFIG.geolocation.maximumAge
                }
            );
        });
    }

    /**
     * Get the location based on the user's choice.
     * If the user chooses "Current Location", it will use the Geolocation API.
     * If the user chooses "Map Center", it will use the center of the map.
     * @param {Object} map - The Leaflet map object.
     * @returns {Promise<void>} A promise that resolves when the location is set.
     */
    static async getLocation(map){
        const mode = document.querySelector('input[name="locationMode"]:checked').value;
        if (mode === 'current') {
            return await LocationService.getUserLocation()
        } else {
            const center = map.getCenter();
            return {
                lat: center.lat,
                lon: center.lng
            };
        }
    }
}