export class UIService {

    /**
     * Show a status message to the user.
     * @param {string} message - The message to display.
     * @param {string} [type='loading'] - The type of message ('loading', 'success', 'error').
     */
    static showStatus(message, type = 'loading') {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
    }

    // Hide status message
    static hideStatus() {
        const statusDiv = document.getElementById('status');
        statusDiv.style.display = 'none';
    }

    /**
     * Display the list of coffee shops in the UI.
     * @param {Array} coffeeShops - An array of coffee shop objects to display.
     */
    static displayCoffeeShops(coffeeShops) {
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
                ${shop.distance_km ? `<p><strong>Distance:</strong> <span class="distance">${UIService.formatDistance(shop.distance_km)}</span></p>` : ''}
                <p><strong>Status:</strong> ${UIService.getStatusDisplay(shop.openNow)}</p>
            `;
            coffeeShopsDiv.appendChild(shopElement);
        });
    }

    /**
     * Format the distance in meters or kilometers.
     * @param {*} km
     * @returns {string} A formatted string representing the distance in meters or kilometers.
     */
    static formatDistance(km) {
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
    static getStatusDisplay(openNow) {
        if (openNow === true) return '🟢 Open Now';
        if (openNow === false) return '🔴 Closed';
        return '🟡 Unknown';
    }
}