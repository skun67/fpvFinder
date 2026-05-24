import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MapPin,
  Satellite,
  Navigation,
  ArrowUp,
  Gauge,
  AlertTriangle,
} from "lucide-react";
import {
  formatDistance,
  formatCoordinates,
  formatAltitude,
  formatSpeed,
  calculateDistance,
} from "../utils/helpers";

const DRAG_THRESHOLD = 56;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

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
  const [dragOffset, setDragOffset] = useState(0);
  const dragRef = useRef({
    startY: 0,
    startExpanded: true,
    pointerId: null,
    currentDelta: 0,
  });

  const effectiveDronePosition = dronePosition || lastKnownPosition || null;

  const distance = useMemo(() => {
    if (!pilotPosition || !effectiveDronePosition) {
      return null;
    }

    return calculateDistance(
      pilotPosition.latitude,
      pilotPosition.longitude,
      effectiveDronePosition.latitude,
      effectiveDronePosition.longitude,
    );
  }, [effectiveDronePosition, pilotPosition]);

  const formatLostTime = useCallback((timestamp) => {
    if (!timestamp) return "---";

    return new Date(timestamp).toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, []);

  const onHandlePointerDown = useCallback(
    (event) => {
      if (event.button !== undefined && event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      dragRef.current = {
        startY: event.clientY,
        startExpanded: isExpanded,
        pointerId: event.pointerId,
        currentDelta: 0,
      };
      setIsDragging(true);
      setDragOffset(0);
    },
    [isExpanded],
  );

  useEffect(() => {
    if (!isDragging) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      if (
        dragRef.current.pointerId !== null &&
        event.pointerId !== dragRef.current.pointerId
      ) {
        return;
      }

      const delta = event.clientY - dragRef.current.startY;
      dragRef.current.currentDelta = delta;
      setDragOffset(clamp(delta * 0.25, -28, 28));
    };

    const handlePointerUp = (event) => {
      if (
        dragRef.current.pointerId !== null &&
        event.pointerId !== dragRef.current.pointerId
      ) {
        return;
      }

      const delta = dragRef.current.currentDelta;
      const shouldExpand = dragRef.current.startExpanded
        ? delta < DRAG_THRESHOLD
        : delta < -DRAG_THRESHOLD;

      setIsExpanded(shouldExpand);
      setIsDragging(false);
      setDragOffset(0);
      dragRef.current.pointerId = null;
      dragRef.current.currentDelta = 0;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging]);

  return (
    <div
      className="absolute bottom-4 left-4 right-4 z-[1000] sm:bottom-5 sm:left-5 sm:right-5 lg:bottom-6 lg:left-6 lg:right-6"
      style={{
        transform: `translate3d(0, ${dragOffset}px, 0)`,
        transition: isDragging
          ? "none"
          : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="relative mx-auto w-full max-w-[860px] overflow-hidden rounded-[34px] border border-white/12 bg-[linear-gradient(180deg,rgba(12,18,28,0.70),rgba(12,18,28,0.90))] shadow-[0_-24px_70px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_35%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

        <div className="relative flex justify-center px-5 pt-5 text-center sm:px-6 sm:pt-6">
          <div
            onPointerDown={onHandlePointerDown}
            className="mx-auto flex w-full max-w-[230px] cursor-grab select-none items-center justify-center rounded-full border border-white/14 bg-white/8 px-4 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl active:cursor-grabbing"
            role="presentation"
            style={{ touchAction: "none" }}
          >
            <div className="flex items-center justify-center gap-3">
              <div className="h-2.5 w-14 rounded-full bg-white/35" />
            </div>
          </div>
        </div>

        <div className="safe-area-bottom px-6 pb-6 pt-6 text-center sm:px-7 sm:pb-7 sm:pt-7">
          <div className="grid grid-cols-1 gap-5 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-3">
                <div
                  className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${
                    isConnected
                      ? "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)]"
                      : "animate-pulse bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                  }`}
                />
                <div className="min-w-0 text-center">
                  <div
                    className={`text-[13px] font-semibold tracking-[0.24em] sm:text-sm ${
                      isConnected ? "text-white" : "text-red-300"
                    }`}
                  >
                    {isConnected ? "ONLINE" : "DISCONNECTED"}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-300/80 sm:text-xs">
                    {timeSinceLastSeen
                      ? `Ostatnia ramka: ${timeSinceLastSeen}`
                      : "Oczekiwanie na telemetrię"}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[28px] font-semibold leading-none tracking-tight text-white sm:text-[34px]">
                  {formatDistance(distance)}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.34em] text-gray-500">
                  Odległość
                </div>
              </div>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-out ${
                isExpanded
                  ? "mt-1 max-h-[40rem] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-2">
                <div className="rounded-[26px] border border-white/10 bg-white/7 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
                  <div className="mb-1.5 flex items-center justify-center gap-2">
                    <Navigation className="h-4 w-4 text-yellow-400" />
                    <span className="text-[11px] uppercase tracking-[0.22em] text-gray-400">
                      Odległość
                    </span>
                  </div>
                  <div className="text-[22px] font-semibold leading-none text-white sm:text-[28px]">
                    {formatDistance(distance)}
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/7 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
                  <div className="mb-1.5 flex items-center justify-center gap-2">
                    <ArrowUp className="h-4 w-4 text-sky-400" />
                    <span className="text-[11px] uppercase tracking-[0.22em] text-gray-400">
                      Wysokość
                    </span>
                  </div>
                  <div className="text-[22px] font-semibold leading-none text-white sm:text-[28px]">
                    {formatAltitude(altitude)}
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/7 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
                  <div className="mb-1.5 flex items-center justify-center gap-2">
                    <Gauge className="h-4 w-4 text-violet-400" />
                    <span className="text-[11px] uppercase tracking-[0.22em] text-gray-400">
                      Prędkość
                    </span>
                  </div>
                  <div className="text-[22px] font-semibold leading-none text-white sm:text-[28px]">
                    {formatSpeed(speed)}
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/7 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
                  <div className="mb-1.5 flex items-center justify-center gap-2">
                    <Satellite className="h-4 w-4 text-cyan-400" />
                    <span className="text-[11px] uppercase tracking-[0.22em] text-gray-400">
                      Satelity
                    </span>
                  </div>
                  <div className="text-[22px] font-semibold leading-none text-white sm:text-[28px]">
                    {satellites !== null ? `${satellites}` : "---"}
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/7 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:col-span-2">
                  <div className="mb-1.5 flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    <span className="text-[11px] uppercase tracking-[0.22em] text-gray-400">
                      Współrzędne
                    </span>
                  </div>
                  <div className="break-words font-mono text-[13px] leading-relaxed text-emerald-300 sm:text-base">
                    {effectiveDronePosition
                      ? formatCoordinates(
                          effectiveDronePosition.latitude,
                          effectiveDronePosition.longitude,
                        )
                      : "---"}
                  </div>
                </div>

                {isDroneLost && lastKnownPosition && (
                  <div className="rounded-[26px] border border-red-500/30 bg-red-500/16 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:col-span-2">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-300" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-200">
                        POŁĄCZENIE ZERWANE
                      </span>
                    </div>
                    <div className="mb-3 text-xs leading-relaxed text-red-100/80">
                      Ostatni sygnał:{" "}
                      {formatLostTime(lastKnownPosition.savedAt)}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onLostDroneNavigate(
                          lastKnownPosition.latitude,
                          lastKnownPosition.longitude,
                        )
                      }
                      className="mx-auto flex w-full max-w-[280px] items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-600"
                    >
                      <Navigation className="h-4 w-4" />
                      Nawiguj do drona
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
