import { AdvancedMarker, APIProvider, Map, Pin, useMap } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";
import { useMapContext } from "../MapContext";

export const DynamicMap = () => {
  const { coords } = useMapContext();
  const [markers, setMarkers] = useState([]);

  const map = useMap();
  console.log(coords);

  //react watches for coords state change and pans to
  //new coords when it changes
  //note this only changes the map camera view
  //it does not reset the coords itself
  useEffect(() => {
    if (!map) return;
    map.panTo(coords);
  }, [map, coords]);

  return (
    <div className="mapContainer">
      <Map
        style={{ width: "600px", height: "600px" }}
        defaultCenter={coords}
        defaultZoom={13}
        mapId={`8ddeff7eddcb919481a5064b`}
        gestureHandling="greedy"
        controlled={false}
        disableDefaultUI
      >
        {/* marker/pin @ user location/coords lat/lng */}
        <AdvancedMarker position={coords}>
          <Pin
            background={"#077187"}
            borderColor={"#074F57"}
            glyphColor={"#00E8FC"}
            scale={Number(1.3)}
          />
        </AdvancedMarker>

        {/* only add custom map markers if they exist */}
        {markers.length > 1
          ? markers.map((marker) => <AdvancedMarker position={marker.location} />)
          : null}
      </Map>
    </div>
  );
};
