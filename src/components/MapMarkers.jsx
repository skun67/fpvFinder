import { DivIcon } from "leaflet";
import { useEffect } from "react";

// Drone icon SVG
const droneIconSvg = `
<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="18" cy="18" r="16" fill="#EF4444" stroke="#DC2626" stroke-width="2"/>
  <circle cx="18" cy="18" r="12" fill="#FCA5A5"/>
  <path d="M18 10L18 26M10 18L26 18" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
  <circle cx="18" cy="18" r="4" fill="#DC2626"/>
  <circle cx="18" cy="18" r="2" fill="#7F1D1D"/>
</svg>
`;

// Pilot icon SVG (blue dot with ring)
const pilotIconSvg = `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="14" fill="#3B82F6" fill-opacity="0.3" stroke="#3B82F6" stroke-width="2"/>
  <circle cx="16" cy="16" r="8" fill="#3B82F6" stroke="#2563EB" stroke-width="2"/>
  <circle cx="16" cy="16" r="4" fill="#93C5FD"/>
</svg>
`;

// Lost drone icon (with warning)
const lostDroneIconSvg = `
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="18" fill="#EF4444" stroke="#DC2626" stroke-width="2"/>
  <path d="M20 8L20 32M12 14L28 28M28 14L12 28" stroke="#7F1D1D" stroke-width="2" stroke-linecap="round"/>
  <circle cx="20" cy="20" r="10" fill="#FCA5A5" fill-opacity="0.5"/>
</svg>
`;

/**
 * Create a Leaflet DivIcon for custom markers
 */
function createMarkerIcon(svgString, className, size = [36, 36]) {
  return new DivIcon({
    className: className,
    html: svgString,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
  });
}

// Export icon creators
export const droneIcon = createMarkerIcon(droneIconSvg, "drone-marker");
export const pilotIcon = createMarkerIcon(
  pilotIconSvg,
  "pilot-marker",
  [32, 32],
);
export const lostDroneIcon = createMarkerIcon(
  lostDroneIconSvg,
  "drone-marker-lost",
);

/**
 * DroneMarker component - displays drone position on map
 */
export function DroneMarker({ position, isLost = false }) {
  const { Marker, Popup } = require("react-leaflet");

  if (!position) return null;

  const icon = isLost ? lostDroneIcon : droneIcon;

  return (
    <Marker position={[position.latitude, position.longitude]} icon={icon}>
      <Popup>
        <div className="text-sm">
          <p className="font-bold mb-1">
            {isLost ? "⚠️ OSTATNIA POZYCJA" : "🚁 DRON"}
          </p>
          <p>Alt: {position.altitude}m</p>
          {position.speed !== undefined && <p>Spd: {position.speed} m/s</p>}
        </div>
      </Popup>
    </Marker>
  );
}

/**
 * PilotMarker component - displays pilot position on map
 */
export function PilotMarker({ position }) {
  const { Marker, Popup } = require("react-leaflet");

  if (!position) return null;

  return (
    <Marker position={[position.latitude, position.longitude]} icon={pilotIcon}>
      <Popup>
        <div className="text-sm">
          <p className="font-bold mb-1">📍 PILOT</p>
          <p>Dokładność: ±{position.accuracy}m</p>
        </div>
      </Popup>
    </Marker>
  );
}

/**
 * DirectionLine component - draws line from pilot to drone
 */
export function DirectionLine({ pilotPosition, dronePosition }) {
  const { Polyline } = require("react-leaflet");

  if (!pilotPosition || !dronePosition) return null;

  return (
    <Polyline
      positions={[
        [pilotPosition.latitude, pilotPosition.longitude],
        [dronePosition.latitude, dronePosition.longitude],
      ]}
      color="#FBBF24"
      weight={2}
      dashArray="5, 10"
      opacity={0.7}
    />
  );
}
