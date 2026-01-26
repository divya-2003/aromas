import { useState, useEffect, useCallback } from "react";

// Sample college coordinates - UPDATE THESE with actual college location
const COLLEGE_LOCATION = {
  latitude: 17.385044,  // Example: Hyderabad coordinates
  longitude: 78.486671,
  name: "College Campus"
};

// Allowed radius in meters
const ALLOWED_RADIUS_METERS = 500;

interface LocationState {
  isWithinPremises: boolean;
  isLoading: boolean;
  error: string | null;
  distance: number | null;
  hasPermission: boolean | null;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function useLocation() {
  const [locationState, setLocationState] = useState<LocationState>({
    isWithinPremises: false,
    isLoading: true,
    error: null,
    distance: null,
    hasPermission: null,
  });

  const checkLocation = useCallback(() => {
    setLocationState(prev => ({ ...prev, isLoading: true, error: null }));

    if (!navigator.geolocation) {
      setLocationState({
        isWithinPremises: false,
        isLoading: false,
        error: "Geolocation is not supported by your browser",
        distance: null,
        hasPermission: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(
          latitude,
          longitude,
          COLLEGE_LOCATION.latitude,
          COLLEGE_LOCATION.longitude
        );

        const isWithin = distance <= ALLOWED_RADIUS_METERS;

        setLocationState({
          isWithinPremises: isWithin,
          isLoading: false,
          error: null,
          distance: Math.round(distance),
          hasPermission: true,
        });
      },
      (error) => {
        let errorMessage = "Unable to get your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services to order.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }

        setLocationState({
          isWithinPremises: false,
          isLoading: false,
          error: errorMessage,
          distance: null,
          hasPermission: error.code !== error.PERMISSION_DENIED ? null : false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache location for 1 minute
      }
    );
  }, []);

  useEffect(() => {
    checkLocation();
  }, [checkLocation]);

  return {
    ...locationState,
    refreshLocation: checkLocation,
    allowedRadius: ALLOWED_RADIUS_METERS,
    collegeName: COLLEGE_LOCATION.name,
  };
}
