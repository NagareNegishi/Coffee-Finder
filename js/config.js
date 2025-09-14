// supabase configuration
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Application configuration
export const CONFIG = {

    // Search settings
    search: {
        defaultRadius: 5000,        // meters
        minResults: 5,
        maxResults: 20,
        maxCacheDays: 14
    },

    // Geolocation settings
    geolocation: {
        enableHighAccuracy: true, // need high accuracy for better results
        timeout: 10000, // user will not wait more than 10 seconds
        maximumAge: 300000 // lets assume user's location does not change drastically in 5 minutes
    },

    // Map settings (using Leaflet)
    map: {
        defaultCenter: [51.505, -0.09], // London
        defaultZoom: 13,
        minZoom: 5, // prevent zooming out too far
        maxZoom: 18,
        tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },

    // overpass settings
    overpass: {
        url: 'https://overpass-api.de/api/interpreter',
        timeout: 25
    }
};