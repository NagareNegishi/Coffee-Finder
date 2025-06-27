export class MapService {
    
    // Static properties for the MapService
    static map = null;
    static markers = [];

    /**
     *  Initialize the map with the center of London
     */
    static initMap() {
        MapService.map = L.map('map').setView([51.505, -0.09], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(MapService.map);
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