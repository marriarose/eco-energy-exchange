import { useEffect, useState } from "react";

export function useGeolocation() {
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords(pos.coords),
      (err) => setError(err.message)
    );
  }, []);

  return { coords, error };
}
