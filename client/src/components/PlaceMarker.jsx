import { useAdvancedMarkerRef, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { useState, useCallback } from "react";

export function PlaceMarker({ placeMarker }) {
  const [infoWindowShown, setInfoWindowShown] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [hoverTime, setHoverTimer] = useState();

  const handleMouseEnter = useCallback(() => {
    setHoverTimer(setTimeout(() => setInfoWindowShown(true), 600));
  }, []);
  const handleMouseLeave = useCallback(() => {
    setHoverTimer(clearTimeout(hoverTime));
  }, [hoverTime]);

  const handleClose = useCallback(() => setInfoWindowShown(false), []);

  placeMarker = {
    ...placeMarker,
    location: {
      lat: placeMarker.location.latitude,
      lng: placeMarker.location.longitude,
    },
  };

  return (
    <AdvancedMarker
      position={placeMarker.location}
      ref={markerRef}
      title={placeMarker.displayName.text}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {infoWindowShown ? (
        <InfoWindow className="searchPlaceMarker" anchor={marker} onClose={handleClose}>
          <h2>{placeMarker.displayName.text}</h2>
          <p>Address: {placeMarker.formattedAddress}</p>
          {placeMarker.websiteUri ? (
            <p>
              Website: <a href={placeMarker.websiteUri}>{placeMarker.websiteUri}</a>
            </p>
          ) : null}
        </InfoWindow>
      ) : null}
    </AdvancedMarker>
  );
}
