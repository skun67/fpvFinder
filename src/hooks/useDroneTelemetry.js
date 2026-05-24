import { useState, useEffect, useCallback, useRef, useMemo } from "react";

const BACKPACK_IP = "192.168.4.1";
const WS_URL = `ws://${BACKPACK_IP}/ws`;
const HTTP_URL = `http://${BACKPACK_IP}/api/telemetry`;
const STORAGE_KEY = "fpvfinder_last_drone_position";

function readSavedPosition() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn("Failed to load saved drone position:", error);
    return null;
  }
}

function normalizeTelemetry(data) {
  const latitude = Number(data?.lat ?? data?.latitude);
  const longitude = Number(data?.lon ?? data?.lng ?? data?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    altitude: Number.isFinite(Number(data?.alt ?? data?.altitude))
      ? Number(data?.alt ?? data?.altitude)
      : null,
    speed: Number.isFinite(Number(data?.speed ?? data?.spd))
      ? Number(data?.speed ?? data?.spd)
      : null,
    satellites: Number.isFinite(Number(data?.sats ?? data?.satellites))
      ? Number(data?.sats ?? data?.satellites)
      : null,
    hdop: Number.isFinite(Number(data?.hdop)) ? Number(data.hdop) : null,
  };
}

export function useDroneTelemetry(enableMock = false) {
  const [dronePosition, setDronePosition] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastSeen, setLastSeen] = useState(null);
  const [satellites, setSatellites] = useState(null);
  const [hdop, setHdop] = useState(null);
  const [altitude, setAltitude] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [hasLiveTelemetry, setHasLiveTelemetry] = useState(false);
  const [lastKnownPosition, setLastKnownPosition] = useState(() =>
    readSavedPosition(),
  );
  const [now, setNow] = useState(() => Date.now());
  const [telemetrySource, setTelemetrySource] = useState(null);
  const [lastRawTelemetry, setLastRawTelemetry] = useState(null);
  const [telemetryFeed, setTelemetryFeed] = useState([]);
  const [connectionMode, setConnectionMode] = useState("idle");
  const [wsReadyState, setWsReadyState] = useState("closed");
  const [httpPollingActive, setHttpPollingActive] = useState(false);

  const wsRef = useRef(null);
  const httpIntervalRef = useRef(null);
  const mockIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const shouldReconnectRef = useRef(true);
  const lastTelemetryAtRef = useRef(null);
  const connectWebSocketRef = useRef(null);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const stopHttpPolling = useCallback(() => {
    if (httpIntervalRef.current) {
      clearInterval(httpIntervalRef.current);
      httpIntervalRef.current = null;
    }
    setHttpPollingActive(false);
  }, []);

  const savePosition = useCallback((position) => {
    try {
      const dataToSave = {
        ...position,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setLastKnownPosition(dataToSave);
    } catch (error) {
      console.warn("Failed to save drone position:", error);
    }
  }, []);

  const applyTelemetry = useCallback(
    (data, source = "unknown", rawPayload = null) => {
      const position = normalizeTelemetry(data);

      if (!position) {
        return;
      }

      const now = Date.now();

      setDronePosition(position);
      setLastSeen(now);
      lastTelemetryAtRef.current = now;
      setHasLiveTelemetry(true);
      setTelemetrySource(source);
      setLastRawTelemetry(
        rawPayload ?? data ?? position ?? null,
      );
      setTelemetryFeed((currentFeed) => [
        {
          id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
          receivedAt: now,
          source,
          payload: rawPayload ?? data ?? position ?? null,
          parsed: position,
        },
        ...currentFeed.slice(0, 19),
      ]);
      setSatellites(position.satellites);
      setHdop(position.hdop);
      setAltitude(position.altitude);
      setSpeed(position.speed);
      setConnected(true);
      setError(null);
      savePosition(position);
    },
    [savePosition],
  );

  const startMockTelemetry = useCallback(() => {
    const startLat = 52.231;
    const startLng = 21.015;
    let time = 0;

    const initialPos = {
      latitude: startLat,
      longitude: startLng,
      altitude: 30,
      speed: 0,
      satellites: 12,
      hdop: 0.8,
    };

    const now = Date.now();
    setConnectionMode("mock");
    setDronePosition(initialPos);
    setConnected(true);
    setLastSeen(now);
    setHasLiveTelemetry(true);
    setSatellites(12);
    setHdop(0.8);
    setAltitude(30);
    setSpeed(0);
    savePosition(initialPos);
    lastTelemetryAtRef.current = now;

    mockIntervalRef.current = setInterval(() => {
      time += 0.3;

      const lat = startLat + Math.sin(time * 0.15) * 0.004;
      const lng = startLng + Math.cos(time * 0.12) * 0.005;
      const alt = 30 + Math.sin(time * 0.2) * 20 + Math.random() * 2;
      const spd = 5 + Math.abs(Math.sin(time * 0.1)) * 10 + Math.random();
      const sats = 10 + Math.floor(Math.random() * 6);
      const hdopVal = 0.6 + Math.random() * 0.5;

      applyTelemetry({
        latitude: lat,
        longitude: lng,
        altitude: Math.round(alt),
        speed: Math.round(spd),
        satellites: sats,
        hdop: Number(hdopVal.toFixed(2)),
      }, "mock", {
        latitude: lat,
        longitude: lng,
        altitude: Math.round(alt),
        speed: Math.round(spd),
        satellites: sats,
        hdop: Number(hdopVal.toFixed(2)),
      });
    }, 500);
  }, [applyTelemetry, savePosition]);

  const stopMockTelemetry = useCallback(() => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
    setConnected(false);
    setDronePosition(null);
    setConnectionMode("mock-stopped");
  }, []);

  const connectWebSocket = useCallback(() => {
    try {
      shouldReconnectRef.current = true;
      stopHttpPolling();
      setConnectionMode("ws");
      setWsReadyState("connecting");

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected to Backpack");
        clearReconnectTimeout();
        setConnected(true);
        setError(null);
        lastTelemetryAtRef.current = Date.now();
        setWsReadyState("open");
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          applyTelemetry(parsed, "ws", parsed);
        } catch (parseError) {
          console.warn("Failed to parse WebSocket message:", parseError);
          setLastRawTelemetry(event.data);
          setTelemetryFeed((currentFeed) => [
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              receivedAt: Date.now(),
              source: "ws-raw",
              payload: event.data,
              parsed: null,
            },
            ...currentFeed.slice(0, 19),
          ]);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setConnected(false);
        setDronePosition(null);
        setWsReadyState("closed");

        if (!shouldReconnectRef.current) {
          return;
        }

        clearReconnectTimeout();
        reconnectTimeoutRef.current = setTimeout(() => {
          if (
            shouldReconnectRef.current &&
            (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)
          ) {
            connectWebSocketRef.current?.();
          }
        }, 3000);
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("Connection error");
        setWsReadyState("error");
      };
    } catch (connectError) {
      console.error("Failed to create WebSocket:", connectError);
      setError("Failed to connect");
      setWsReadyState("error");
    }
  }, [applyTelemetry, clearReconnectTimeout, stopHttpPolling]);

  useEffect(() => {
    connectWebSocketRef.current = connectWebSocket;
  }, [connectWebSocket]);

  const startHttpPolling = useCallback(() => {
    stopHttpPolling();
    setConnectionMode("http");
    setHttpPollingActive(true);

    const fetchTelemetry = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(HTTP_URL, {
          method: "GET",
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          applyTelemetry(data, "http", data);
        }
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          console.warn("HTTP polling error:", fetchError);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    httpIntervalRef.current = setInterval(fetchTelemetry, 1000);
    fetchTelemetry();
  }, [applyTelemetry, stopHttpPolling]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    clearReconnectTimeout();

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    stopHttpPolling();
    setConnected(false);
    setConnectionMode("idle");
  }, [clearReconnectTimeout, stopHttpPolling]);

  useEffect(() => {
    if (enableMock) {
      const startMockTimer = setTimeout(() => {
        startMockTelemetry();
      }, 0);

      return () => {
        clearTimeout(startMockTimer);
        stopMockTelemetry();
      };
    }

    const connectionStart = setTimeout(() => {
      connectWebSocket();
    }, 0);

    const httpFallback = setTimeout(() => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        console.log("WebSocket failed, trying HTTP polling...");
        startHttpPolling();
      }
    }, 2000);

    return () => {
      clearTimeout(connectionStart);
      clearTimeout(httpFallback);
      disconnect();
    };
  }, [clearReconnectTimeout, connectWebSocket, disconnect, enableMock, startHttpPolling, startMockTelemetry, stopMockTelemetry]);

  useEffect(() => {
    if (enableMock) {
      return undefined;
    }

    const watchdog = setInterval(() => {
      if (!lastTelemetryAtRef.current) {
        return;
      }

      const staleForMs = Date.now() - lastTelemetryAtRef.current;

      if (staleForMs > 2500) {
        setConnected(false);
        setDronePosition(null);
      }
    }, 1000);

    return () => clearInterval(watchdog);
  }, [enableMock]);

  useEffect(() => {
    const clock = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(clock);
  }, []);

  const timeSinceLastSeen = useMemo(() => {
    if (!lastSeen) return null;

    const diff = now - lastSeen;
    if (diff < 1000) return "<1s";

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, [lastSeen, now]);

  return {
    dronePosition,
    connected,
    error,
    lastSeen,
    timeSinceLastSeen,
    satellites,
    hdop,
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
    disconnect,
  };
}

export default useDroneTelemetry;
