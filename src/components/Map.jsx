import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DroneMarker, PilotMarker, DirectionLine } from "./MapMarkers";

// ESRI World Imagery satellite tiles (free, no API key required)
const SATELLITE_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const TILE_ATTRIBUTION =
  "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

/**
 * Component to update map center and zoom dynamically
 */
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  return null;
}

/**
 * Component to handle map events and auto-fit bounds
 */
function MapEvents({ onMove }) {
  useMapEvents({
    moveend: (e) => {
      if (onMove) {
        onMove(e.target.getCenter());
      }
    },
  });
  return null;
}

/**
 * Main Map component with satellite tiles
 */
export default function Map({
  pilotPosition,
  dronePosition,
  isDroneLost = false,
  onCenterChange,
  defaultCenter = [52.2297, 21.0122], // Warsaw
  defaultZoom = 15,
}) {
  // Calculate center based on pilot and drone positions
  const calculateCenter = () => {
    if (pilotPosition && dronePosition) {
      return [
        (pilotPosition.latitude + dronePosition.latitude) / 2,
        (pilotPosition.longitude + dronePosition.longitude) / 2,
      ];
    }
    if (pilotPosition) {
      return [pilotPosition.latitude, pilotPosition.longitude];
    }
    if (dronePosition) {
      return [dronePosition.latitude, dronePosition.longitude];
    }
    return defaultCenter;
  };

  const center = calculateCenter();

  // Determine zoom level based on distance between pilot and drone
  const calculateZoom = () => {
    if (pilotPosition && dronePosition) {
      const latDiff = Math.abs(pilotPosition.latitude - dronePosition.latitude);
      const lngDiff = Math.abs(
        pilotPosition.longitude - dronePosition.longitude,
      );
      const maxDiff = Math.max(latDiff, lngDiff);

      if (maxDiff < 0.001) return 17; // Very close
      if (maxDiff < 0.005) return 16; // Close
      if (maxDiff < 0.02) return 15; // Medium
      if (maxDiff < 0.05) return 14; // Far
      return 13; // Very far
    }
    return defaultZoom;
  };

  const zoom = calculateZoom();

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          url={SATELLITE_TILE_URL}
          attribution={TILE_ATTRIBUTION}
          maxZoom={19}
        />

        {/* Dynamic map control */}
        <MapController center={center} zoom={zoom} />

        {/* Map events */}
        <MapEvents onMove={onCenterChange} />

        {/* Direction line from pilot to drone */}
        {pilotPosition && dronePosition && (
          <DirectionLine
            pilotPosition={pilotPosition}
            dronePosition={dronePosition}
          />
        )}

        {/* Pilot marker */}
        {pilotPosition && <PilotMarker position={pilotPosition} />}

        {/* Drone marker */}
        {dronePosition && (
          <DroneMarker position={dronePosition} isLost={isDroneLost} />
        )}
      </MapContainer>
    </div>
  );
}
