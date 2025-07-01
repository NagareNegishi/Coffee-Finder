export class OpeningHoursService {

/**
 * Check if a venue is open now - handles most common OSM formats
 * @param {string} openingHours - The opening hours string from OSM
 * @returns {boolean|null} true if open, false if closed, null if unknown
 */
static isOpenNow(openingHours) {
    if (!openingHours) return null; // 🟡 Unknown
    if (openingHours === '24/7') return true; // 🟢 Always open

    const now = new Date();
    const day = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][now.getDay()]; // getDay() returns 0 for Sunday
    const time = now.getHours() * 100 + now.getMinutes(); // convert to HHMM format

    // Handle common formats like "Mo-Fr 08:00-17:00" or "Mo,We,Fr 09:00-18:00"
    try{
        // Split by semicolon for multiple rules
        const rules = openingHours.split(';');
        for (const rule of rules) {
            const trimmedRule = rule.trim(); // Remove leading/trailing spaces

            // Day range with time: "Mo-Fr 08:00-17:00"
            const dayTimeMatch = trimmedRule.match(/^([A-Za-z,-]+)\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
            if (dayTimeMatch) {
                const dayPart = dayTimeMatch[1];
                
                // First check if today is included
                if (OpeningHoursService.isDayIncluded(day, dayPart)) {
                    // If day matches, then check time
                    const startTime = parseInt(dayTimeMatch[2]) * 100 + parseInt(dayTimeMatch[3]);
                    const endTime = parseInt(dayTimeMatch[4]) * 100 + parseInt(dayTimeMatch[5]);
                    return time >= startTime && time <= endTime;
                }
                // If day doesn't match, continue to next rule
                continue;
            }

            // No day range, just time: "08:00-17:00"
            const timeMatch = trimmedRule.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
            if (timeMatch) {
                const startTime = parseInt(timeMatch[1]) * 100 + parseInt(timeMatch[2]);
                const endTime = parseInt(timeMatch[3]) * 100 + parseInt(timeMatch[4]);
                return time >= startTime && time <= endTime;
            }
        }
    } catch (error) {
        console.warn('Could not parse opening hours:', openingHours);
    }
    return null; // 🟡 Unknown
}

    /**
     * Check if current day is included in day specification
     * @param {string} currentDay - Current day (Mo, Tu, etc.)
     * @param {string} dayRange - Day specification (Mo-Fr, Mo,We,Fr, etc.)
     * @returns {boolean} True if day is included
     */
    static isDayIncluded(currentDay, dayRange) {
        // Handle ranges like "Mo-Fr"
        if (dayRange.includes('-')) {
            const [start, end] = dayRange.split('-');
            const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
            const startIdx = days.indexOf(start);
            const endIdx = days.indexOf(end);
            const currentIdx = days.indexOf(currentDay);
            
            if (startIdx !== -1 && endIdx !== -1 && currentIdx !== -1) {
                return currentIdx >= startIdx && currentIdx <= endIdx;
            }
        }
        
        // Handle comma-separated days like "Mo,We,Fr"
        if (dayRange.includes(',')) {
            return dayRange.split(',').includes(currentDay);
        }
        
        // Single day
        return dayRange === currentDay;
    }

    /**
     * Add openNow property to each coffee shop based on its opening hours.
     * @param {*} coffeeShops 
     * @returns {Array} Array of coffee shop objects with openNow property added
     */
    static addOpenNow(coffeeShops) {
        return coffeeShops.map(shop => ({
            ...shop,
            openNow: OpeningHoursService.isOpenNow(shop.opening_hours)
        }));
    }

    /**
     * Filter coffee shops that are currently open.
     * Important: This function assumes that the coffee shops have been processed with `addOpenNow` first.
     * If used in wrong order, it will return an empty array.
     *
     * @param {Array} coffeeShops - Array of coffee shop objects
     * @param {boolean} now - If true, filter only open coffee shops
     * @returns {Array} Filtered array of coffee shops that are currently open
     */
    static filterOpenNow(coffeeShops, now) {
        if (!now) return coffeeShops;
        return coffeeShops.filter(shop => shop.openNow === true);
    }
}