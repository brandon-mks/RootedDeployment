import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useState } from "react";

export const DynamicMap = () => {
  const [coords, setCoords] = useState({ lat: 37.548334, lng: -77.449523 });
  //state set to richmond on first render

  //richmond coords: 37.548334, -77.449523
  // latitude: 37.548334,
  // longitude: -77.449523,
  return (
    <Map
      style={{ width: "600px", height: "600px" }}
      defaultCenter={coords}
      defaultZoom={13}
      gestureHandling="greedy"
      disableDefaultUI
    />
  );
};
