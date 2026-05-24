/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(meters) {
  if (meters === null || meters === undefined || isNaN(meters)) {
    return "---";
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Format coordinates for display
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} Formatted coordinates string
 */
export function formatCoordinates(lat, lng) {
  if (!lat || !lng) return "---";
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
}

/**
 * Format altitude for display
 * @param {number} altitude - Altitude in meters
 * @returns {string} Formatted altitude string
 */
export function formatAltitude(altitude) {
  if (altitude === null || altitude === undefined || isNaN(altitude)) {
    return "---";
  }
  return `${Math.round(altitude)} m`;
}

/**
 * Format speed for display
 * @param {number} speed - Speed in m/s
 * @returns {string} Formatted speed string
 */
export function formatSpeed(speed) {
  if (speed === null || speed === undefined || isNaN(speed)) {
    return "---";
  }
  return `${Math.round(speed * 3.6)} km/h`;
}

/**
 * Generate Google Maps navigation URL
 * @param {number} lat - Destination latitude
 * @param {number} lng - Destination longitude
 * @returns {string} Google Maps URL
 */
export function generateMapsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Generate Apple Maps navigation URL
 * @param {number} lat - Destination latitude
 * @param {number} lng - Destination longitude
 * @returns {string} Apple Maps URL
 */
export function generateAppleMapsUrl(lat, lng) {
  return `https://maps.apple.com/?daddr=${lat},${lng}`;
}

/**
 * Detect if device is iOS
 * @returns {boolean}
 */
export function isIOS() {
  return (
    ["iPad", "iPhone", "iPod"].includes(navigator.platform) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

/**
 * Get appropriate maps URL based on device
 * @param {number} lat - Destination latitude
 * @param {number} lng - Destination longitude
 * @returns {string} Maps URL
 */
export function getNavigationUrl(lat, lng) {
  if (isIOS()) {
    return generateAppleMapsUrl(lat, lng);
  }
  return generateMapsUrl(lat, lng);
}
