import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  useMap,
  MapControl,
  ControlPosition,
} from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";
import { useMapContext } from "../mapContext/useMapContext";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { IconButton, Tooltip } from "@mui/material";

export const DynamicMap = () => {
  const { coords } = useMapContext();
  const [ markers ] = useState([]);

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
        <MapControl position={ControlPosition.INLINE_END_BLOCK_CENTER}>
          <Tooltip title="Click to re-center to your location">
            <IconButton
              aria-label="recenter map"
              onClick={() => map.panTo(coords)}
              sx={{
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                bgcolor: "rgba(255, 255, 255, .7)",
                "&:hover": {
                  backgroundColor: `white`,
                },
              }}
            >
              <MyLocationIcon
                sx={{
                  fontSize: 50,
                }}
              ></MyLocationIcon>
            </IconButton>
          </Tooltip>
        </MapControl>
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
