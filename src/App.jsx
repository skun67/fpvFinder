import { useState, useCallback } from "react";
import Map from "./components/Map";
import InfoPanel from "./components/InfoPanel";
import SettingsPanel from "./components/SettingsPanel";
import { useUserLocation } from "./hooks/useUserLocation";
import { useDroneTelemetry } from "./hooks/useDroneTelemetry";
import { getNavigationUrl } from "./utils/helpers";
import "./App.css";

function App() {
  const [isMockMode, setIsMockMode] = useState(false);

  const {
    location: pilotLocation,
    error: pilotError,
    loading: pilotLoading,
    accuracy: pilotAccuracy,
  } = useUserLocation(isMockMode);

  const {
    dronePosition,
    connected,
    timeSinceLastSeen,
    satellites,
    altitude,
    speed,
    hasLiveTelemetry,
    lastKnownPosition,
  } = useDroneTelemetry(isMockMode);

  const displayDronePosition = dronePosition || lastKnownPosition || null;
  const isDroneLost =
    !connected && hasLiveTelemetry && Boolean(displayDronePosition);

  const handleLostDroneNavigate = useCallback((lat, lng) => {
    const url = getNavigationUrl(lat, lng);
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const pilotPosition = pilotLocation
    ? {
        latitude: pilotLocation.latitude,
        longitude: pilotLocation.longitude,
        accuracy: pilotAccuracy,
      }
    : null;

  return (
    <div className="relative h-full w-full overflow-hidden bg-gray-950">
      <Map
        pilotPosition={pilotPosition}
        dronePosition={displayDronePosition}
        isDroneLost={isDroneLost}
      />

      <SettingsPanel
        isMockMode={isMockMode}
        onToggleMockMode={() => setIsMockMode((value) => !value)}
      />

      {pilotError && !isMockMode && (
        <div className="absolute top-20 left-4 right-4 z-[1100] rounded-2xl border border-yellow-700/50 bg-yellow-900/80 px-4 py-3 text-sm text-yellow-200 backdrop-blur-xl">
          <p className="font-medium">⚠ {pilotError}</p>
        </div>
      )}

      {pilotLoading && !isMockMode && (
        <div className="absolute left-1/2 top-1/2 z-[1100] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-gray-900/80 px-6 py-4 backdrop-blur-xl">
          <div className="text-center text-white">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-sm">Lokalizacja GPS...</p>
          </div>
        </div>
      )}

      <InfoPanel
        pilotPosition={pilotPosition}
        dronePosition={displayDronePosition}
        isConnected={connected}
        satellites={satellites}
        altitude={altitude}
        speed={speed}
        timeSinceLastSeen={timeSinceLastSeen}
        isDroneLost={isDroneLost}
        lastKnownPosition={lastKnownPosition}
        onLostDroneNavigate={handleLostDroneNavigate}
      />
    </div>
  );
}

export default App;
