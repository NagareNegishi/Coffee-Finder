import { CONFIG } from '../config.js';

export class MapService {
    
    // Static properties for the MapService
    static map = null;
    static markers = [];
    static searchCircle = null;

    /**
     *  Initialize the map with the center of London
     */
    static initMap() {
        MapService.map = L.map('map', {
            minZoom: CONFIG.map.minZoom, // prevent zooming out too far
            maxZoom: CONFIG.map.maxZoom, // prevent zooming in too far
        }).setView(CONFIG.map.defaultCenter, CONFIG.map.defaultZoom);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: CONFIG.map.maxZoom,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(MapService.map);

        MapService.addCircle({ lat: 51.505, lng: -0.09 }, 2000); // Default circle for London

        // Disable transition during zoom
        MapService.map.on('zoomstart', () => {
            const elements = document.querySelectorAll('.leaflet-interactive');
            elements.forEach(el => el.classList.add('no-transition'));
        });
        
        // Re-enable transition after zoom
        MapService.map.on('zoomend', () => {
            setTimeout(() => {
                const elements = document.querySelectorAll('.leaflet-interactive');
                elements.forEach(el => el.classList.remove('no-transition'));
            }, 10);
        });

        MapService.map.on('moveend', () => {
            // Update the circle position when the map is moved
            if (MapService.searchCircle) {
                const center = MapService.map.getCenter();
                MapService.updateCircle(center, MapService.searchCircle.getRadius());
            }
        });
    }

    // Disable map interaction methods
    static disableMapInteraction() {
        if (MapService.map) {
            MapService.map.dragging.disable();
            MapService.map.touchZoom.disable();
            MapService.map.doubleClickZoom.disable();
            MapService.map.scrollWheelZoom.disable();
            MapService.map.boxZoom.disable();
            MapService.map.keyboard.disable();
        }
    }
    // Enable map interaction methods
    static enableMapInteraction() {
        if (MapService.map) {
            MapService.map.dragging.enable();
            MapService.map.touchZoom.enable();
            MapService.map.doubleClickZoom.enable();
            MapService.map.scrollWheelZoom.enable();
            MapService.map.boxZoom.enable();
            MapService.map.keyboard.enable();
        }
    }

    // Show loading overlay with a message
    static showSearchLoading() {
        const overlay = document.getElementById('mapLoadingOverlay');
        const text = overlay.querySelector('.map-loading-text');
        text.textContent = 'Searching for coffee shops...';
        overlay.style.display = 'flex';
        MapService.disableMapInteraction();
    }

    // Hide the loading overlay
    static hideSearchLoading() {
        document.getElementById('mapLoadingOverlay').style.display = 'none';
        MapService.enableMapInteraction();
    }

    // Update the center of the map
    static updateMapCenter(location) {
        if (MapService.map && location) {
            MapService.map.setView([location.lat, location.lon], MapService.map.getZoom());
            console.log(`Map center updated to: ${location.lat}, ${location.lon}`);
        } else {
            console.error('Map is not initialized or location is invalid.');
        }
    }

    /**
     * Add a circle to the map representing the search radius.
     * @param {Object} center - The center of the circle, could be a { lat, lng } object
     * @param {number} radius - The radius in meters
     */
    static addCircle(center, radius) {
        MapService.removeCircle();
        MapService.searchCircle = L.circle([center.lat, center.lng], {
            color: '#4A90E2',
            weight: 2,
            opacity: 0.6,
            fillColor: '#30f',
            fillOpacity: 0.05,
            radius: radius
        }).addTo(MapService.map);
    }

    // Update the existing circle with a new center and radius
    static updateCircle(center,radius) {
        if (MapService.searchCircle) {
            MapService.searchCircle.setLatLng([center.lat, center.lng]);
            MapService.searchCircle.setRadius(radius);
        }
    }

    // Remove the existing circle if it exists
    static removeCircle() {
        if (MapService.searchCircle) {
            MapService.map.removeLayer(MapService.searchCircle);
            MapService.searchCircle = null;
        }
    }

    /**
     * Add markers to the map for each coffee shop found.
     * @param {Array} coffeeShops - An array of coffee shop objects
     */
    static addMarker(coffeeShops){
        if (coffeeShops.length === 0) return;

        // clear existing markers
        MapService.markers.forEach(marker => {
            MapService.map.removeLayer(marker);
        });
        MapService.markers = []; // reset markers array

        // Add markers for each coffee shop
        coffeeShops.forEach(shop => {
            // first add marker to the map
            const marker = L.marker([shop.latitude, shop.longitude]).addTo(MapService.map);
            
            // then add the popup to the marker
            marker.bindPopup(`
                <strong>${shop.name}</strong><br>
                ${shop.address ? `<p>${shop.address}</p>` : ''}
                ${shop.opening_hours ? `<p>Opening Hours: ${shop.opening_hours}</p>` : ''}
                ${shop.phone ? `<p>Phone: ${shop.phone}</p>` : ''}
                ${shop.website ? `<p>Website: <a href="${shop.website}" target="_blank">${shop.website}</a></p>` : ''}
            `);
            MapService.markers.push(marker); // add marker to the markers array
        }
        );

        // If there are markers, fit the map bounds to show all markers
        // Since our search is radius based, we will not get markers that are too far away
        if (MapService.markers.length > 0) {
            const group = new L.featureGroup(MapService.markers);
            MapService.map.fitBounds(group.getBounds().pad(0.1));
        }
    }
}