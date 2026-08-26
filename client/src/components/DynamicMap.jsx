import {
  AdvancedMarker,
  ControlPosition,
  InfoWindow,
  Map,
  MapControl,
  Pin,
  useAdvancedMarkerRef,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { Button, IconButton, Tooltip } from "@mui/material";

import { useMapContext } from "../mapContext/useMapContext";
import { PlaceMarker } from "./PlaceMarker";

const RICHMOND_CENTER = {
  lat: 37.5407,
  lng: -77.436,
};

function isValidPosition(position) {
  return (
    Number.isFinite(Number(position?.lat)) &&
    Number.isFinite(Number(position?.lng))
  );
}

function RecenterControl({ position, onRecenter }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !isValidPosition(position)) {
      return;
    }

    map.panTo(position);
  }, [map, position]);

  const handleRecenter = () => {
    if (!map || !isValidPosition(position)) {
      return;
    }

    map.panTo(position);
    onRecenter();
  };

  return (
    <MapControl position={ControlPosition.INLINE_END_BLOCK_CENTER}>
      <Tooltip title="Click to re-center the map">
        <span>
          <IconButton
            type="button"
            aria-label="Re-center map"
            onClick={handleRecenter}
            disabled={!map}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.88)",
              boxShadow: "0 1px 4px rgba(0, 0, 0, 0.3)",
              "&:hover": {
                backgroundColor: "#ffffff",
              },
            }}
          >
            <MyLocationIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </span>
      </Tooltip>
    </MapControl>
  );
}

export const DynamicMap = ({ places = [] }) => {
  const { coords } = useMapContext();

  const [infoWindowShown, setInfoWindowShown] = useState(false);
  const [mainMarkerShown, setMainMarkerShown] = useState(true);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const hasCurrentPosition = isValidPosition(coords);
  const mapCenter = hasCurrentPosition ? coords : RICHMOND_CENTER;

  const markers = Array.isArray(places)
    ? places.filter((place) => isValidPosition(place?.location))
    : [];

  const handleHideMainMarker = () => {
    setInfoWindowShown(false);
    setMainMarkerShown(false);
  };

  const handleRecenter = () => {
    setMainMarkerShown(true);
  };

  return (
    <div className="mapContainer">
      <Map
        style={{
          width: "100%",
          height: "clamp(320px, 52vh, 600px)",
        }}
        defaultCenter={mapCenter}
        defaultZoom={13}
        mapId="8ddeff7eddcb919481a5064b"
        gestureHandling="greedy"
        controlled={false}
        disableDefaultUI
      >
        <RecenterControl
          position={mapCenter}
          onRecenter={handleRecenter}
        />

        {mainMarkerShown && hasCurrentPosition ? (
          <AdvancedMarker
            position={coords}
            title="Current center of the map"
            ref={markerRef}
            onClick={() => setInfoWindowShown(true)}
            onMouseEnter={() => setInfoWindowShown(true)}
          >
            <Pin
              background="#077187"
              borderColor="#074F57"
              glyphColor="#00E8FC"
              scale={1.3}
            />

            {infoWindowShown ? (
              <InfoWindow
                className="changeCenterInfoWindow"
                anchor={marker}
                onClose={() => setInfoWindowShown(false)}
              >
                <div>
                  <h2>Map Center</h2>

                  <p>This is the current center of the map.</p>

                  <Button
                    type="button"
                    size="small"
                    onClick={handleHideMainMarker}
                  >
                    Hide marker
                  </Button>
                </div>
              </InfoWindow>
            ) : null}
          </AdvancedMarker>
        ) : null}

        {markers.map((placeMarker) => (
          <PlaceMarker
            key={placeMarker.id}
            placeMarker={placeMarker}
          />
        ))}
      </Map>
    </div>
  );
};
