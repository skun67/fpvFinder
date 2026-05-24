import { Marker, Popup, Polyline } from "react-leaflet";
import { droneIcon, pilotIcon, lostDroneIcon } from "./mapIcons";

export function DroneMarker({ position, isLost = false }) {
  if (!position) return null;

  const icon = isLost ? lostDroneIcon : droneIcon;

  return (
    <Marker position={[position.latitude, position.longitude]} icon={icon}>
      <Popup>
        <div className="text-sm">
          <p className="mb-1 font-bold">
            {isLost ? "⚠ OSTATNIA POZYCJA" : "DRON"}
          </p>
          <p>Alt: {position.altitude ?? "---"}m</p>
          {position.speed !== undefined && <p>Spd: {position.speed} m/s</p>}
        </div>
      </Popup>
    </Marker>
  );
}

export function PilotMarker({ position }) {
  if (!position) return null;

  return (
    <Marker position={[position.latitude, position.longitude]} icon={pilotIcon}>
      <Popup>
        <div className="text-sm">
          <p className="mb-1 font-bold">PILOT</p>
          <p>Dokładność: ±{position.accuracy}m</p>
        </div>
      </Popup>
    </Marker>
  );
}

export function DirectionLine({ pilotPosition, dronePosition }) {
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
