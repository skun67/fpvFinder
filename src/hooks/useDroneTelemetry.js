import { useState, useEffect, useCallback, useRef, useMemo } from "react";

const BACKPACK_IP = "192.168.4.1";
const WS_URL = `ws://${BACKPACK_IP}/ws`;
const HTTP_URL = `http://${BACKPACK_IP}/api/telemetry`;
const STORAGE_KEY = "fpvfinder_last_drone_position";

/**
 * Custom hook for drone telemetry connection
 * Connects to ELRS Backpack via WebSocket or HTTP polling
 * Implements fail-safe: saves last known position to localStorage
 */
export function useDroneTelemetry(enableMock = false) {
  const [dronePosition, setDronePosition] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastSeen, setLastSeen] = useState(null);
  const [satellites, setSatellites] = useState(null);
  const [hdop, setHdop] = useState(null);
  const [altitude, setAltitude] = useState(null);
  const [speed, setSpeed] = useState(null);

  const wsRef = useRef(null);
  const httpIntervalRef = useRef(null);
  const mockIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Load last known position from localStorage on mount
  const loadLastKnownPosition = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (e) {
      console.warn("Failed to load saved drone position:", e);
    }
    return null;
  }, []);

  // Save current position to localStorage
  const savePosition = useCallback((position) => {
    try {
      const dataToSave = {
        ...position,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn("Failed to save drone position:", e);
    }
  }, []);

  // Mock drone data for development
  const startMockTelemetry = useCallback(() => {
    const startLat = 52.231;
    const startLng = 21.015;
    let time = 0;

    // Set initial mock position
    const initialPos = {
      latitude: startLat,
      longitude: startLng,
      altitude: 30,
      speed: 0,
      satellites: 12,
      hdop: 0.8,
    };
    setDronePosition(initialPos);
    setConnected(true);
    setLastSeen(Date.now());
    setSatellites(12);
    setHdop(0.8);
    setAltitude(30);
    setSpeed(0);
    savePosition(initialPos);

    mockIntervalRef.current = setInterval(() => {
      time += 0.3;
      const lat = startLat + Math.sin(time * 0.15) * 0.004;
      const lng = startLng + Math.cos(time * 0.12) * 0.005;
      const alt = 30 + Math.sin(time * 0.2) * 20 + Math.random() * 2;
      const spd = 5 + Math.abs(Math.sin(time * 0.1)) * 10 + Math.random();
      const sats = 10 + Math.floor(Math.random() * 6);
      const hdopVal = 0.6 + Math.random() * 0.5;

      const mockData = {
        latitude: lat,
        longitude: lng,
        altitude: Math.round(alt),
        speed: Math.round(spd),
        satellites: sats,
        hdop: parseFloat(hdopVal.toFixed(2)),
      };

      setDronePosition(mockData);
      setLastSeen(Date.now());
      setSatellites(sats);
      setHdop(parseFloat(hdopVal.toFixed(2)));
      setAltitude(Math.round(alt));
      setSpeed(Math.round(spd));
      setConnected(true);
      setError(null);
      savePosition(mockData);
    }, 500);
  }, [savePosition]);

  const stopMockTelemetry = useCallback(() => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
    setConnected(false);
  }, []);

  // HTTP polling fallback
  const startHttpPolling = useCallback(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await fetch(HTTP_URL, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          const data = await response.json();
          const position = {
            latitude: data.lat || data.latitude,
            longitude: data.lon || data.lng || data.longitude,
            altitude: data.alt || data.altitude,
            speed: data.speed || data.spd,
            satellites: data.sats || data.satellites,
            hdop: data.hdop,
          };

          if (position.latitude && position.longitude) {
            setDronePosition(position);
            setLastSeen(Date.now());
            setSatellites(position.satellites || null);
            setHdop(position.hdop || null);
            setAltitude(position.altitude || null);
            setSpeed(position.speed || null);
            setConnected(true);
            setError(null);
            savePosition(position);
          }
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          console.warn("HTTP polling error:", e);
        }
      }
    };

    httpIntervalRef.current = setInterval(fetchTelemetry, 1000);
    fetchTelemetry();
  }, [savePosition]);

  const stopHttpPolling = useCallback(() => {
    if (httpIntervalRef.current) {
      clearInterval(httpIntervalRef.current);
      httpIntervalRef.current = null;
    }
  }, []);

  // WebSocket connection - using useRef to avoid forward reference issue
  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log("WebSocket connected to Backpack");
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const position = {
            latitude: data.lat || data.latitude,
            longitude: data.lon || data.lng || data.longitude,
            altitude: data.alt || data.altitude,
            speed: data.speed || data.spd,
            satellites: data.sats || data.satellites,
            hdop: data.hdop,
          };

          if (position.latitude && position.longitude) {
            setDronePosition(position);
            setLastSeen(Date.now());
            setSatellites(position.satellites || null);
            setHdop(position.hdop || null);
            setAltitude(position.altitude || null);
            setSpeed(position.speed || null);
            setConnected(true);
            setError(null);
            savePosition(position);
          }
        } catch (e) {
          console.warn("Failed to parse WebSocket message:", e);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setConnected(false);
        // Use a ref-based approach to avoid forward reference
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            // Re-create WebSocket connection
            try {
              const newWs = new WebSocket(WS_URL);
              wsRef.current = newWs;

              newWs.onopen = () => {
                console.log("WebSocket reconnected to Backpack");
                setConnected(true);
                setError(null);
              };

              newWs.onmessage = (event) => {
                try {
                  const data = JSON.parse(event.data);
                  const position = {
                    latitude: data.lat || data.latitude,
                    longitude: data.lon || data.lng || data.longitude,
                    altitude: data.alt || data.altitude,
                    speed: data.speed || data.spd,
                    satellites: data.sats || data.satellites,
                    hdop: data.hdop,
                  };

                  if (position.latitude && position.longitude) {
                    setDronePosition(position);
                    setLastSeen(Date.now());
                    setSatellites(position.satellites || null);
                    setHdop(position.hdop || null);
                    setAltitude(position.altitude || null);
                    setSpeed(position.speed || null);
                    setConnected(true);
                    setError(null);
                    savePosition(position);
                  }
                } catch (e) {
                  console.warn("Failed to parse WebSocket message:", e);
                }
              };

              newWs.onclose = () => {
                console.log("WebSocket disconnected again");
                setConnected(false);
                // Schedule another reconnect attempt
                reconnectTimeoutRef.current = setTimeout(() => {
                  if (
                    !wsRef.current ||
                    wsRef.current.readyState === WebSocket.CLOSED
                  ) {
                    // This will be handled by the main effect
                  }
                }, 3000);
              };

              newWs.onerror = (err) => {
                console.error("WebSocket reconnection error:", err);
                setError("Connection error");
              };
            } catch (e) {
              console.error("Failed to reconnect WebSocket:", e);
            }
          }
        }, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError("Connection error");
      };

      wsRef.current = ws;
    } catch (e) {
      console.error("Failed to create WebSocket:", e);
      setError("Failed to connect");
    }
  }, [savePosition]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    stopHttpPolling();
    setConnected(false);
  }, [stopHttpPolling]);

  // Main effect for connection management
  useEffect(() => {
    // Handle mock mode
    if (enableMock) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startMockTelemetry();
      return () => {
        stopMockTelemetry();
      };
    }

    // Try WebSocket first
    connectWebSocket();

    // Fallback to HTTP polling after 2 seconds if not connected
    const httpFallback = setTimeout(() => {
      if (!connected && wsRef.current?.readyState !== WebSocket.OPEN) {
        console.log("WebSocket failed, trying HTTP polling...");
        startHttpPolling();
      }
    }, 2000);

    return () => {
      clearTimeout(httpFallback);
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableMock]); // Only depend on enableMock to avoid re-triggering

  // Calculate time since last signal
  const timeSinceLastSeen = useMemo(() => {
    if (!lastSeen) return null;
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - lastSeen;
    if (diff < 1000) return "<1s";
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, [lastSeen]);

  // Get last known position from localStorage
  const lastKnownPosition = useMemo(
    () => loadLastKnownPosition(),
    [loadLastKnownPosition],
  );

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
    lastKnownPosition,
    disconnect,
  };
}

export default useDroneTelemetry;
