import { 
    useAdvancedMarkerRef,
    AdvancedMarker,
    InfoWindow
 } from "@vis.gl/react-google-maps"
import { useState, useCallback } from "react";

export function PlaceMarker({ placeMarker }) {

    const [infoWindowShown, setInfoWindowShown] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();

    const handleMouseEnter = useCallback(() => setInfoWindowShown(true));

    const handleClose = useCallback(() => setInfoWindowShown(false), []);

return (
    <AdvancedMarker
    position={placeMarker.location}
    ref={markerRef}
    title={placeMarker.name}
    onMouseEnter={handleMouseEnter}
    >
        {infoWindowShown ? (
        <InfoWindow className="searchPlaceMarker"
        anchor={marker} 
        onClose={handleClose}>
          <h2>{placeMarker.name}</h2>
          <p>Address: {placeMarker.address}</p>
          {placeMarker.website.length > 1 ? 
        <p>Website: <a href={placeMarker.website}>{placeMarker.website}</a></p>
        :
        null 
        }
        </InfoWindow>)
        : null}
    </AdvancedMarker>
)
}