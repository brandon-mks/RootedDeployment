import { useContext } from "react";
import { MapContext } from "./MapContext";

export function useMapContext() {
  const context = useContext(MapContext);
  if (!context) {
    throw Error("useAuth must be used within AuthProvider");
  }
  return context;
}
