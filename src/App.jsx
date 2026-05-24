import { useState, useCallback } from "react";
import Map from "./components/Map";
import InfoPanel from "./components/InfoPanel";
import SettingsPanel from "./components/SettingsPanel";
import { useUserLocation } from "./hooks/useUserLocation";
import { useDroneTelemetry } from "./hooks/useDroneTelemetry";
import { getNavigationUrl } from "./utils/helpers";
import "./App.css";

function App() {
  // Mock mode state (for development without real hardware)
  const [isMockMode, setIsMockMode] = useState(false);

  // User location hook
  const {
    location: pilotLocation,
    error: pilotError,
    loading: pilotLoading,
    accuracy: pilotAccuracy,
  } = useUserLocation(isMockMode);

  // Drone telemetry hook
  const {
    dronePosition,
    connected,
    error: droneError,
    timeSinceLastSeen,
    satellites,
    altitude,
    speed,
    lastKnownPosition,
  } = useDroneTelemetry(isMockMode);

  // Determine if drone is lost (disconnected but we have last known position)
  const isDroneLost = !connected && lastKnownPosition !== null;

  // Handle navigation to lost drone
  const handleLostDroneNavigate = useCallback((lat, lng) => {
    const url = getNavigationUrl(lat, lng);
    window.open(url, "_blank");
  }, []);

  // Prepare pilot position with accuracy info
  const pilotPosition = pilotLocation
    ? {
        latitude: pilotLocation.latitude,
        longitude: pilotLocation.longitude,
        accuracy: pilotAccuracy,
      }
    : null;

  return (
    <div className="relative h-full w-full bg-gray-900 overflow-hidden">
      {/* Map Component */}
      <Map
        pilotPosition={pilotPosition}
        dronePosition={
          dronePosition || (isDroneLost ? lastKnownPosition : null)
        }
        isDroneLost={isDroneLost}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isMockMode={isMockMode}
        onToggleMockMode={() => setIsMockMode(!isMockMode)}
      />

      {/* Pilot location error overlay */}
      {pilotError && !isMockMode && (
        <div className="absolute top-4 left-4 right-16 z-[1100] bg-yellow-900/90 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
          <p className="font-medium">⚠️ {pilotError}</p>
        </div>
      )}

      {/* Loading indicator */}
      {pilotLoading && !isMockMode && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1100] bg-gray-900/80 px-6 py-4 rounded-xl border border-gray-700 backdrop-blur-sm">
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Lokalizacja GPS...</p>
          </div>
        </div>
      )}

      {/* Info Panel - Always visible at bottom */}
      <InfoPanel
        pilotPosition={pilotPosition}
        dronePosition={dronePosition}
        isConnected={connected}
        satellites={satellites}
        altitude={altitude}
        speed={speed}
        timeSinceLastSeen={timeSinceLastSeen}
        isDroneLost={isDroneLost}
        lastKnownPosition={lastKnownPosition}
        onLostDroneNavigate={handleLostDroneNavigate}
      />

      {/* Title/Logo overlay */}
      <div className="absolute top-4 left-4 z-[1100]">
        <div className="bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
          <h1 className="text-white font-bold text-lg">FPV Finder</h1>
          <p className="text-xs text-gray-400">Śledzenie drona na żywo</p>
        </div>
      </div>
    </div>
  );
}

export default App;
