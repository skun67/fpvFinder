import { useState, useRef, useEffect, useCallback } from "react";
import {
  MapPin,
  Satellite,
  Navigation,
  ArrowUp,
  Gauge,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  formatDistance,
  formatCoordinates,
  formatAltitude,
  formatSpeed,
  calculateDistance,
} from "../utils/helpers";

/**
 * InfoPanel component - Apple-style liquid glass design
 * Collapsible with smooth drag gesture
 */
export default function InfoPanel({
  pilotPosition,
  dronePosition,
  isConnected = false,
  satellites = null,
  altitude = null,
  speed = null,
  timeSinceLastSeen = null,
  isDroneLost = false,
  lastKnownPosition = null,
  onLostDroneNavigate,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef(null);
  const dragStartY = useRef(0);
  const dragStartExpanded = useRef(true);

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

  // Handle touch/mouse drag for collapsible panel
  const handleDragStart = useCallback(
    (clientY) => {
      setIsDragging(true);
      dragStartY.current = clientY;
      dragStartExpanded.current = isExpanded;
    },
    [isExpanded],
  );

  const handleDragMove = useCallback(
    (clientY) => {
      if (!isDragging) return;

      const deltaY = dragStartY.current - clientY;
      const threshold = 50; // Minimum drag distance to trigger collapse

      if (dragStartExpanded.current && deltaY < -threshold) {
        setIsExpanded(false);
        setIsDragging(false);
      } else if (!dragStartExpanded.current && deltaY > threshold) {
        setIsExpanded(true);
        setIsDragging(false);
      }
    },
    [isDragging],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers
  const handleTouchStart = (e) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    handleDragMove(e.touches[0].clientY);
  };

  // Mouse handlers
  const handleMouseDown = (e) => {
    handleDragStart(e.clientY);
  };

  const handleMouseMove = useCallback(
    (e) => {
      handleDragMove(e.clientY);
    },
    [handleDragMove],
  );

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleToggleClick = () => {
    if (!isDragging) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      ref={panelRef}
      className={`absolute bottom-0 left-0 right-0 z-[1000] transition-all duration-500 ease-out ${
        isExpanded ? "translate-y-0" : "translate-y-[calc(100%-56px)]"
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Glass panel container */}
      <div className="bg-gray-900/70 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
        {/* Drag handle / Collapsed view */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
          onClick={handleToggleClick}
        >
          {/* Connection status indicator */}
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected
                  ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"
                  : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"
              }`}
            />
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold text-sm ${
                  isConnected ? "text-white" : "text-red-400"
                }`}
              >
                {isConnected ? "ONLINE" : "ROZŁĄCZONO"}
              </span>
              {timeSinceLastSeen && (
                <span className="text-xs text-gray-400">
                  {timeSinceLastSeen}
                </span>
              )}
            </div>
          </div>

          {/* Quick stats in collapsed view */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {formatDistance(distance)}
              </div>
              <div className="text-xs text-gray-500">odległość</div>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Expanded content */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Main Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 pt-0">
            {/* Distance */}
            <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400 text-xs">Odległość</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatDistance(distance)}
              </div>
            </div>

            {/* Altitude */}
            <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUp className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400 text-xs">Wysokość</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatAltitude(altitude)}
              </div>
            </div>

            {/* Speed */}
            <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400 text-xs">Prędkość</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatSpeed(speed)}
              </div>
            </div>

            {/* Satellites */}
            <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Satellite className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-400 text-xs">Satelity</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {satellites !== null ? `${satellites}` : "---"}
              </div>
            </div>

            {/* Coordinates */}
            <div className="col-span-2 bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-gray-400 text-xs">Współrzędne</span>
              </div>
              <div className="text-sm font-mono text-green-400">
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

            {/* Lost Drone Alert */}
            {isDroneLost && lastKnownPosition && (
              <div className="col-span-2 bg-red-500/20 rounded-2xl p-3 border border-red-500/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-xs font-bold">
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
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  NAWIGUJ DO DRONA
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
