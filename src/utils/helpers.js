/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
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

export function formatDistance(meters) {
  if (meters === null || meters === undefined || isNaN(meters)) {
    return "---";
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatCoordinates(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return "---";
  }

  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";

  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(
    6,
  )}° ${lngDir}`;
}

export function formatAltitude(altitude) {
  if (altitude === null || altitude === undefined || isNaN(altitude)) {
    return "---";
  }

  return `${Math.round(altitude)} m`;
}

export function formatSpeed(speed) {
  if (speed === null || speed === undefined || isNaN(speed)) {
    return "---";
  }

  return `${Math.round(speed * 3.6)} km/h`;
}

export function generateMapsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function generateAppleMapsUrl(lat, lng) {
  return `https://maps.apple.com/?daddr=${lat},${lng}`;
}

export function isIOS() {
  return (
    ["iPad", "iPhone", "iPod"].includes(navigator.platform) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

export function getNavigationUrl(lat, lng) {
  if (isIOS()) {
    return generateAppleMapsUrl(lat, lng);
  }

  return generateMapsUrl(lat, lng);
}
