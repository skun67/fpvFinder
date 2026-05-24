import { DivIcon } from "leaflet";

// Drone icon SVG - modern, minimalistic design
export const droneIconSvg = `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Drone body -->
  <circle cx="16" cy="16" r="8" fill="#EF4444" stroke="#DC2626" stroke-width="1.5"/>
  <!-- Drone arms -->
  <line x1="16" y1="8" x2="16" y2="4" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
  <line x1="16" y1="24" x2="16" y2="28" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
  <line x1="8" y1="16" x2="4" y2="16" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
  <line x1="24" y1="16" x2="28" y2="16" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
  <!-- Propellers -->
  <circle cx="16" cy="4" r="3" fill="#FCA5A5" fill-opacity="0.6" stroke="#DC2626" stroke-width="1"/>
  <circle cx="16" cy="28" r="3" fill="#FCA5A5" fill-opacity="0.6" stroke="#DC2626" stroke-width="1"/>
  <circle cx="4" cy="16" r="3" fill="#FCA5A5" fill-opacity="0.6" stroke="#DC2626" stroke-width="1"/>
  <circle cx="28" cy="16" r="3" fill="#FCA5A5" fill-opacity="0.6" stroke="#DC2626" stroke-width="1"/>
  <!-- Center dot -->
  <circle cx="16" cy="16" r="3" fill="#7F1D1D"/>
</svg>
`;

// Pilot icon SVG (blue dot with ring)
export const pilotIconSvg = `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="14" fill="#3B82F6" fill-opacity="0.3" stroke="#3B82F6" stroke-width="2"/>
  <circle cx="16" cy="16" r="8" fill="#3B82F6" stroke="#2563EB" stroke-width="2"/>
  <circle cx="16" cy="16" r="4" fill="#93C5FD"/>
</svg>
`;

// Lost drone icon (with pulsing effect)
export const lostDroneIconSvg = `
<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Outer pulse ring -->
  <circle cx="18" cy="18" r="16" fill="#EF4444" fill-opacity="0.2" stroke="#DC2626" stroke-width="2" stroke-dasharray="4 4"/>
  <!-- Drone body -->
  <circle cx="18" cy="18" r="8" fill="#EF4444" stroke="#DC2626" stroke-width="1.5"/>
  <!-- Drone arms -->
  <line x1="18" y1="10" x2="18" y2="6" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
  <line x1="18" y1="26" x2="18" y2="30" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
  <line x1="10" y1="18" x2="6" y2="18" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
  <line x1="26" y1="18" x2="30" y2="18" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
  <!-- Propellers -->
  <circle cx="18" cy="6" r="3" fill="#FCA5A5" fill-opacity="0.6" stroke="#DC2626" stroke-width="1"/>
  <circle cx="18" cy="30" r="3" fill="#FCA5A5" fill-opacity="0.6" stroke="#DC2626" stroke-width="1"/>
  <circle cx="6" cy="18" r="3" fill="#FCA5A5" fill-opacity="0.6" stroke="#DC2626" stroke-width="1"/>
  <circle cx="30" cy="18" r="3" fill="#FCA5A5" fill-opacity="0.6" stroke="#DC2626" stroke-width="1"/>
  <!-- Center X mark -->
  <path d="M14 14L22 22M22 14L14 22" stroke="#7F1D1D" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

/**
 * Create a Leaflet DivIcon for custom markers
 */
function createMarkerIcon(svgString, className, size = [32, 32]) {
  return new DivIcon({
    className: className,
    html: svgString,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
  });
}

// Export icon instances
export const pilotIcon = createMarkerIcon(
  pilotIconSvg,
  "pilot-marker",
  [32, 32],
);
export const droneIcon = createMarkerIcon(droneIconSvg, "drone-marker");
export const lostDroneIcon = createMarkerIcon(
  lostDroneIconSvg,
  "drone-marker-lost",
  [36, 36],
);
