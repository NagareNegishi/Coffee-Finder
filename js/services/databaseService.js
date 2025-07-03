import { supabase } from '../config.js';

export class DatabaseService {

    /**
     * Save coffee shops to the database using Supabase.
     * @param {*} coffeeShops
     * @returns  {Promise<{success: boolean, data?: Array, error?: string}>}
     */
    static async saveCoffeeShopsToDatabase(coffeeShops) {
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
     * @param {Object} userLocation - The user's location (latitude and longitude).
     * @param {*} radius
     * @param {*} max_results
     * @returns {Promise<Array>} A promise that resolves with an array of coffee shops.
     * @throws {Error} If there is an error fetching data from the database.
     */
    static async getCoffeeShopsFromDatabase(userLocation, radius = 2.0, max_results = 10) {
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
     * Filter out coffee shops that are older than a specified number of days.
     * @param {*} coffeeShops
     * @param {*} maxDays
     * @returns {Array} An array of coffee shops that are not older than the specified number of days.
     */
    static filterOldResults(coffeeShops, maxDays = 14) {
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
     * Log a search in the database.
     * @param {*} userLocation
     * @param {*} searchMode
     * @param {*} radiusKm
     * @returns {Promise<void>}
     * @throws {Error} If there is an error logging the search.
     */
    static async logSearch(userLocation, searchMode, radiusKm) {
        if (!userLocation || !searchMode || !radiusKm) {
            console.warn('Invalid parameters for logging search');
            return;
        }
        try {
            const { error } = await supabase
                .from('search_logs')
                .insert({
                    search_lat: userLocation.lat,
                    search_lon: userLocation.lon,
                    search_mode: searchMode,
                    radius_km: radiusKm
                });
            if (error) {
                console.error('Error logging search:', error);
            }
        } catch (error) {
            console.error('Error logging search:', error);
        }
    }
}
