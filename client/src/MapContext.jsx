import { createContext, useContext, useEffect, useState } from "react";

const MapContext = createContext();

export function MapContextProvider({ children }) {
  const [coords, setCoords] = useState({ lat: 60.548334, lng: -77.449523 });

  const setLocation = (position) => {
    const userCoords = {
      lat: Number(position.coords.latitude),
      lng: Number(position.coords.longitude),
    };
    setCoords(userCoords);
    console.log(userCoords);
  };

  //useEffect to get user location if browser supports it
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setLocation);
    }
  }, []);

  const value = { coords, setCoords };
  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (!context) {
    throw Error("useAuth must be used within AuthProvider");
  }
  return context;
}
