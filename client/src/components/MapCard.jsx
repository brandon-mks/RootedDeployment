import { AdvancedMarker, APIProvider, Map, Pin } from "@vis.gl/react-google-maps";

export const MapCard = ({ place }) => {
  return (
    <div className="mapContainer">
      <Map
        //vis.gl react-google-maps documentation states
        //200px x 200px is the smallest size map can render
        style={{ width: "100%", height: "300px" }}
        center={place.location}
        //change default zoom as needed to how close you
        //want the map camera to be
        defaultZoom={18}
        mapId={`8ddeff7eddcb919481a5064b`}
        gestureHandling="none"
        controlled={false}
        disableDefaultUI
      >
        {/* marker/pin @ place location/coords lat/lng */}
        <AdvancedMarker position={place.location} />
      </Map>
    </div>
  );
};
