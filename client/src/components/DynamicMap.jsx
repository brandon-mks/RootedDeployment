import {
  AdvancedMarker,
  Map,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  MapControl,
  ControlPosition,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";
import { useMapContext } from "../mapContext/useMapContext";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { IconButton, Tooltip } from "@mui/material";
import { PlaceMarker } from "./PlaceMarker";

export const DynamicMap = ({ places }) => {
  //contexts
  const { coords } = useMapContext();

  //internal states
  const [markers, setMarkers] = useState([]);
  const [infoWindowShown, setInfoWindowShown] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [mainMarkerShown, setMainMarkerShown] = useState(true);

  const map = useMap();

  //react watches for coords state change and pans to
  //new coords when it changes
  //note this only changes the map camera view
  //it does not reset the coords itself
  useEffect(() => {
    if (!map) return;
    map.panTo(coords);
  }, [map, coords]);

  useEffect(() => {
    setMarkers(places);
  }, [places]);

  // const handleClick = useCallback((ev) =>
  // <ChangeCenterMarker ev={ev} />)

  const recenter = () => {
    map.panTo(coords);
    map.setZoom(15);
    setMainMarkerShown(true);
  };

  //const handleMouseEnter = useCallback(() => setInfoWindowShown(true));
  //const handleClose = useCallback(() => setInfoWindowShown(false), []);
  return (
    <div className="mapContainer">
      <Map
        style={{ width: "60%", minWidth: "350px", height: "400px" }}
        defaultCenter={coords}
        defaultZoom={15}
        mapId={`8ddeff7eddcb919481a5064b`}
        gestureHandling="greedy"
        controlled={false}
        // onClick={handleClick}
        // onZoomChanged={handleZoomChange}
        disableDefaultUI
      >
        <MapControl position={ControlPosition.INLINE_END_BLOCK_CENTER}>
          <Tooltip title="Click to re-center to your location">
            <IconButton
              aria-label="recenter map"
              onClick={recenter}
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
        {mainMarkerShown ? (
          <AdvancedMarker
            position={coords}
            title={"Current Center of the map"}
            ref={markerRef}
            onMouseEnter={() => setInfoWindowShown(true)}
          >
            <Pin
              background={"#077187"}
              borderColor={"#074F57"}
              glyphColor={"#00E8FC"}
              scale={Number(1.3)}
            />

            {infoWindowShown ? (
              <InfoWindow
                className="changeCenterInfoWindow"
                anchor={marker}
                onClose={() => setInfoWindowShown(false)}
              >
                <h2>Map Center</h2>
                <p>This is the current center of the map!</p>
                <a onClick={() => setMainMarkerShown(false)}>
                  Click to get rid of this marker for now
                </a>
                <br />
              </InfoWindow>
            ) : null}
          </AdvancedMarker>
        ) : null}

        {/* only add custom map markers if they exist */}
        {markers.length
          ? markers.map((placeMarker) => (
              <PlaceMarker key={placeMarker.id} placeMarker={placeMarker} />
            ))
          : null}
      </Map>
    </div>
  );
};
