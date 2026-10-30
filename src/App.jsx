import { useState, useCallback } from "react";
import { Analytics } from "@vercel/analytics/react";
import Map from "./components/Map";
import InfoPanel from "./components/InfoPanel";
import SettingsPanel from "./components/SettingsPanel";
import { useUserLocation } from "./hooks/useUserLocation";
import { useDroneTelemetry } from "./hooks/useDroneTelemetry";
import { getNavigationUrl } from "./utils/helpers";
import "./App.css";

function DebugOverlay({
  isOpen,
  connected,
  connectionMode,
  wsReadyState,
  httpPollingActive,
  error,
  telemetrySource,
  lastSeen,
  timeSinceLastSeen,
  telemetryFeed,
  lastRawTelemetry,
}) {
  if (!isOpen) {
    return null;
  }

  const renderPayload = (payload) => {
    if (payload === null || payload === undefined) {
      return "null";
    }

    if (typeof payload === "string") {
      return payload;
    }

    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return String(payload);
    }
  };

  return (
    <div className="absolute left-4 top-20 z-[1300] w-[min(92vw,460px)] rounded-[28px] border border-sky-400/20 bg-slate-950/80 text-left shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="text-[10px] uppercase tracking-[0.36em] text-sky-300/90">
          Backpack Debug
        </div>
        <div className="mt-2 text-base font-semibold text-white">
          Status połączenia i surowe dane
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-[10px] uppercase tracking-[0.24em] text-gray-400">
              Backpack
            </div>
            <div className={`mt-1 font-semibold ${connected ? "text-green-300" : "text-red-300"}`}>
              {connected ? "ONLINE" : "DISCONNECTED"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-[10px] uppercase tracking-[0.24em] text-gray-400">
              Tryb
            </div>
            <div className="mt-1 font-semibold text-white">{connectionMode}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-[10px] uppercase tracking-[0.24em] text-gray-400">
              WS
            </div>
            <div className="mt-1 font-semibold text-white">{wsReadyState}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-[10px] uppercase tracking-[0.24em] text-gray-400">
              HTTP
            </div>
            <div className="mt-1 font-semibold text-white">
              {httpPollingActive ? "ACTIVE" : "IDLE"}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-gray-300">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <div className="text-gray-500">Ostatnia ramka</div>
            <div className="text-right text-white">{timeSinceLastSeen || "---"}</div>
            <div className="text-gray-500">Źródło</div>
            <div className="text-right text-white">{telemetrySource || "---"}</div>
            <div className="text-gray-500">LastSeen</div>
            <div className="text-right text-white">{lastSeen ? new Date(lastSeen).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "---"}</div>
            <div className="text-gray-500">Błąd</div>
            <div className="text-right text-white">{error || "---"}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-gray-400">
            Ostatni surowy pakiet
          </div>
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-emerald-300">
            {renderPayload(lastRawTelemetry)}
          </pre>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-gray-400">
            Ostatnie pakiety
          </div>
          <div className="max-h-56 space-y-2 overflow-auto pr-1">
            {telemetryFeed.length === 0 ? (
              <div className="text-xs text-gray-500">Brak danych</div>
            ) : (
              telemetryFeed.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-semibold uppercase tracking-[0.18em] text-sky-300">
                      {entry.source}
                    </span>
                    <span className="text-gray-500">
                      {new Date(entry.receivedAt).toLocaleTimeString("pl-PL", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap break-words text-[11px] leading-relaxed text-gray-200">
                    {renderPayload(entry.payload)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isMockMode, setIsMockMode] = useState(false);
  const [isDebugOverlayEnabled, setIsDebugOverlayEnabled] = useState(false);

  const {
    location: pilotLocation,
    error: pilotError,
    loading: pilotLoading,
    accuracy: pilotAccuracy,
  } = useUserLocation(isMockMode);

  const {
    dronePosition,
    connected,
    error,
    lastSeen,
    timeSinceLastSeen,
    satellites,
    altitude,
    speed,
    hasLiveTelemetry,
    lastKnownPosition,
    telemetrySource,
    lastRawTelemetry,
    telemetryFeed,
    connectionMode,
    wsReadyState,
    httpPollingActive,
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
        isDebugOverlayEnabled={isDebugOverlayEnabled}
        onToggleDebugOverlay={() =>
          setIsDebugOverlayEnabled((value) => !value)
        }
      />

      <DebugOverlay
        isOpen={isDebugOverlayEnabled}
        connected={connected}
        connectionMode={connectionMode}
        wsReadyState={wsReadyState}
        httpPollingActive={httpPollingActive}
        error={error}
        telemetrySource={telemetrySource}
        lastSeen={lastSeen}
        timeSinceLastSeen={timeSinceLastSeen}
        telemetryFeed={telemetryFeed}
        lastRawTelemetry={lastRawTelemetry}
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

      <Analytics />
    </div>
  );
}

export default App;
