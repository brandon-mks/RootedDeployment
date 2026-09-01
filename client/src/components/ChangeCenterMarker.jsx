import { AdvancedMarker, Pin, InfoWindow, useMap, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { useMapContext } from "../mapContext/useMapContext";

export function ChangeCenterMarker({ ev }) {
    const { setCoords } = useMapContext;
    const [markerRef, marker] = useAdvancedMarkerRef();

    const map = useMap();

    console.log(ev.latLng);

    return (<AdvancedMarker 
        position={ev.latLng} 
        title={"Mouse clicked location"}
        ref={markerRef}>
          <Pin
            background={"#077187"}
            borderColor={"#074F57"}
            glyphColor={"#00E8FC"}
            scale={Number(1.3)}
          />
        <InfoWindow className="changeCenterInfoWindow"
        anchor={marker} 
        onClose={handleClose}>
          <button onClick={setCoords(ev.latLng)}>Click to redo your search in this area!</button>
          {navigator.geolocation ? (
            <a onClick={map.panTo(navigator.geolocation.getCurrentPosition(setLocation))}>
              Go back to your location
              </a>)
              : null}
        </InfoWindow>
        </AdvancedMarker>)
}