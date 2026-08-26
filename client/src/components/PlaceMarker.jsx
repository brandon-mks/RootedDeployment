import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { useState } from "react";

function isValidPosition(position) {
  return (
    Number.isFinite(Number(position?.lat)) &&
    Number.isFinite(Number(position?.lng))
  );
}

export function PlaceMarker({ placeMarker }) {
  const [infoWindowShown, setInfoWindowShown] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();

  if (!placeMarker || !isValidPosition(placeMarker.location)) {
    return null;
  }

  const website =
    typeof placeMarker.website === "string" &&
    placeMarker.website.trim().length > 0
      ? placeMarker.website.trim()
      : null;

  const placeName = placeMarker.name || "Local place";

  return (
    <AdvancedMarker
      position={placeMarker.location}
      ref={markerRef}
      title={placeName}
      onClick={() => setInfoWindowShown(true)}
      onMouseEnter={() => setInfoWindowShown(true)}
    >
      {infoWindowShown ? (
        <InfoWindow
          className="searchPlaceMarker"
          anchor={marker}
          onClose={() => setInfoWindowShown(false)}
        >
          <div>
            <h2>{placeName}</h2>

            {placeMarker.address ? (
              <p>Address: {placeMarker.address}</p>
            ) : null}

            {website ? (
              <p>
                Website:{" "}
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit website
                </a>
              </p>
            ) : null}
          </div>
        </InfoWindow>
      ) : null}
    </AdvancedMarker>
  );
}