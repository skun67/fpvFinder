import {
  MapPin,
  Satellite,
  Radio,
  Navigation,
  ArrowUp,
  Gauge,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  formatDistance,
  formatCoordinates,
  formatAltitude,
  formatSpeed,
  getNavigationUrl,
  calculateDistance,
} from "../utils/helpers";

/**
 * InfoPanel component - displays telemetry data in a high-contrast dark theme
 * Designed for outdoor visibility in bright sunlight
 */
export default function InfoPanel({
  pilotPosition,
  dronePosition,
  isConnected = false,
  satellites = null,
  altitude = null,
  speed = null,
  lastSeen = null,
  timeSinceLastSeen = null,
  isDroneLost = false,
  lastKnownPosition = null,
  onLostDroneNavigate,
}) {
  // Calculate distance from pilot to drone
  const distance =
    pilotPosition && dronePosition
      ? calculateDistance(
          pilotPosition.latitude,
          pilotPosition.longitude,
          dronePosition.latitude,
          dronePosition.longitude,
        )
      : null;

  // Format the time when signal was lost
  const formatLostTime = (timestamp) => {
    if (!timestamp) return "---";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 safe-area-bottom">
      {/* Connection Status Bar */}
      <div
        className={`px-4 py-2 flex items-center justify-between border-b ${
          isConnected
            ? "bg-green-900/50 border-green-700"
            : "bg-red-900/50 border-red-700 animate-pulse-alert"
        }`}
      >
        <div className="flex items-center gap-2">
          <Radio
            className={`w-5 h-5 ${
              isConnected ? "text-green-400" : "text-red-400"
            }`}
          />
          <span
            className={`font-bold text-sm uppercase tracking-wider ${
              isConnected ? "text-green-400" : "text-red-400"
            }`}
          >
            {isConnected ? "ONLINE" : "ROZŁĄCZONO"}
          </span>
        </div>
        {timeSinceLastSeen && (
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock className="w-3 h-3" />
            <span>{timeSinceLastSeen}</span>
          </div>
        )}
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
        {/* Distance */}
        <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Navigation className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400 text-xs uppercase">Odległość</span>
          </div>
          <div className="text-2xl font-bold text-white text-high-contrast">
            {formatDistance(distance)}
          </div>
        </div>

        {/* Altitude */}
        <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUp className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-xs uppercase">Wysokość</span>
          </div>
          <div className="text-2xl font-bold text-white text-high-contrast">
            {formatAltitude(altitude)}
          </div>
        </div>

        {/* Speed */}
        <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Gauge className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 text-xs uppercase">Prędkość</span>
          </div>
          <div className="text-2xl font-bold text-white text-high-contrast">
            {formatSpeed(speed)}
          </div>
        </div>

        {/* Satellites */}
        <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Satellite className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-400 text-xs uppercase">Satelity</span>
          </div>
          <div className="text-2xl font-bold text-white text-high-contrast">
            {satellites !== null ? `${satellites} szt` : "---"}
          </div>
        </div>

        {/* Coordinates */}
        <div className="col-span-2 bg-gray-800/80 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-xs uppercase">
              Współrzędne drona
            </span>
          </div>
          <div className="text-sm font-mono text-green-400 text-high-contrast">
            {dronePosition
              ? formatCoordinates(
                  dronePosition.latitude,
                  dronePosition.longitude,
                )
              : lastKnownPosition
                ? formatCoordinates(
                    lastKnownPosition.latitude,
                    lastKnownPosition.longitude,
                  )
                : "---"}
          </div>
        </div>

        {/* Lost Drone Info */}
        {isDroneLost && lastKnownPosition && (
          <div className="col-span-2 bg-red-900/30 rounded-lg p-3 border border-red-700">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-xs uppercase font-bold">
                UTRATA SYGNAŁU
              </span>
            </div>
            <div className="text-xs text-red-300 mb-2">
              Ostatnia pozycja: {formatLostTime(lastKnownPosition.savedAt)}
            </div>
            <button
              onClick={() =>
                onLostDroneNavigate(
                  lastKnownPosition.latitude,
                  lastKnownPosition.longitude,
                )
              }
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              NAWIGUJ DO DRONA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
