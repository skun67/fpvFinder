import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DroneMarker, PilotMarker, DirectionLine } from "./MapMarkers";

const SATELLITE_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const TILE_ATTRIBUTION =
  "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

function MapViewFollower({ dronePosition, isFollowingDrone }) {
  const map = useMap();

  useEffect(() => {
    if (!isFollowingDrone || !dronePosition) {
      return;
    }

    map.setView(
      [dronePosition.latitude, dronePosition.longitude],
      map.getZoom(),
      { animate: true },
    );
  }, [dronePosition, isFollowingDrone, map]);

  return null;
}

function MapInteractionTracker({
  onPauseFollow,
  onResumeFollow,
  resumeDelayMs = 5000,
}) {
  const resumeTimerRef = useRef(null);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const markUserActivity = useCallback(
    (event) => {
      if (!event?.originalEvent) {
        return;
      }

      onPauseFollow();
      clearResumeTimer();
      resumeTimerRef.current = setTimeout(() => {
        onResumeFollow();
        resumeTimerRef.current = null;
      }, resumeDelayMs);
    },
    [clearResumeTimer, onPauseFollow, onResumeFollow, resumeDelayMs],
  );

  useMapEvents({
    dragstart: markUserActivity,
    drag: markUserActivity,
    movestart: markUserActivity,
    move: markUserActivity,
    zoomstart: markUserActivity,
    zoom: markUserActivity,
    wheel: markUserActivity,
  });

  useEffect(() => () => clearResumeTimer(), [clearResumeTimer]);

  return null;
}

export default function Map({
  pilotPosition,
  dronePosition,
  isDroneLost = false,
  defaultCenter = [52.2297, 21.0122],
  defaultZoom = 15,
}) {
  const [isFollowingDrone, setIsFollowingDrone] = useState(true);

  const initialCenter = dronePosition
    ? [dronePosition.latitude, dronePosition.longitude]
    : pilotPosition
      ? [pilotPosition.latitude, pilotPosition.longitude]
      : defaultCenter;

  const initialZoom = pilotPosition && dronePosition ? 15 : defaultZoom;

  const pauseFollow = useCallback(() => {
    setIsFollowingDrone(false);
  }, []);

  const resumeFollow = useCallback(() => {
    setIsFollowingDrone(true);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="h-full w-full"
        zoomControl
        attributionControl
      >
        <TileLayer
          url={SATELLITE_TILE_URL}
          attribution={TILE_ATTRIBUTION}
          maxZoom={19}
        />

        <MapInteractionTracker
          onPauseFollow={pauseFollow}
          onResumeFollow={resumeFollow}
        />

        <MapViewFollower
          dronePosition={dronePosition}
          isFollowingDrone={isFollowingDrone}
        />

        {pilotPosition && dronePosition && (
          <DirectionLine
            pilotPosition={pilotPosition}
            dronePosition={dronePosition}
          />
        )}

        {pilotPosition && <PilotMarker position={pilotPosition} />}

        {dronePosition && (
          <DroneMarker position={dronePosition} isLost={isDroneLost} />
        )}
      </MapContainer>
    </div>
  );
}
