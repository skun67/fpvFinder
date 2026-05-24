import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook for tracking user's GPS location
 * Returns current position, accuracy, and loading/error states
 */
export function useUserLocation(enableMock = false) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accuracy, setAccuracy] = useState(null);
  const watchIdRef = useRef(null);
  const mockIntervalRef = useRef(null);

  // Mock location data for development (simulates movement in a park area)
  const startMockLocation = useCallback(() => {
    const startLat = 52.2297; // Warsaw center
    const startLng = 21.0122;
    let time = 0;

    mockIntervalRef.current = setInterval(() => {
      time += 0.5;
      // Simulate walking/driving with some variation
      const lat = startLat + Math.sin(time * 0.1) * 0.002;
      const lng = startLng + Math.cos(time * 0.08) * 0.003;
      const acc = 5 + Math.random() * 10;

      const mockPosition = {
        coords: {
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          altitude: 100 + Math.random() * 20,
          speed: 1 + Math.random() * 3,
        },
        timestamp: Date.now(),
      };

      setLocation(mockPosition.coords);
      setAccuracy(Math.round(acc));
      setLoading(false);
    }, 1000);
  }, []);

  const stopMockLocation = useCallback(() => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enableMock) {
      startMockLocation();
      return () => stopMockLocation();
    }

    // Check if geolocation is available
    if (!navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Geolocation is not supported by this browser");
      setLoading(false);
      return;
    }

    // Success callback
    const handleSuccess = (position) => {
      setLocation(position.coords);
      setAccuracy(Math.round(position.coords.accuracy));
      setError(null);
      setLoading(false);
    };

    // Error callback
    const handleError = (err) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError("Location permission denied. Please enable GPS access.");
          break;
        case err.POSITION_UNAVAILABLE:
          setError("Location information is unavailable.");
          break;
        case err.TIMEOUT:
          setError("Location request timed out.");
          break;
        default:
          setError("An unknown error occurred.");
          break;
      }
      setLoading(false);
    };

    // Request location updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [enableMock, startMockLocation, stopMockLocation]);

  return {
    location,
    error,
    loading,
    accuracy,
    isMock: enableMock,
  };
}

export default useUserLocation;
