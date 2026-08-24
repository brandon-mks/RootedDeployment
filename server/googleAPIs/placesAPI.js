import { createBusiness } from "../db/business.js";
import "dotenv/config";

/**This queries the Google Places API
 * accepts an array of types,
 * a location object { lat, lng }
 * and the zoom level (rounded)
 */
export async function fetchPlaces(types, location, zoom) {
  //change fetch circle radius based on map zoom level
  //if zoom is included when function is called
  //default set to 500
  let scale = 500;
  if (zoom) {
    if (zoom > 0 && zoom <= 5) {
      scale = 200;
    } else if (zoom > 5 && zoom <= 10) {
      scale = 400;
    } else if (zoom > 10 && zoom <= 15) {
      scale = 600;
    } else if (zoom > 15 && zoom <= 20) {
      scale = 900;
    } else if (zoom > 20) {
      scale = 1500;
    }
  }

  const API_KEY = process.env.API_KEY;
  const nearbySearch = "https://places.googleapis.com/v1/places:searchNearby";
  const defaultProperties =
    "places.displayName" +
    ",places.location" +
    ",places.rating" +
    ",places.primaryType" +
    ",places.types" +
    ",places.websiteUri" +
    ",places.id" +
    ",places.formattedAddress" +
    ",places.editorialSummary.text" +
    ",places.internationalPhoneNumber" +
    ",places.reviewSummary.text" +
    ",places.reviewSummary.reviewsUri" +
    ",places.currentOpeningHours";

  try {
    const response = await fetch(`${nearbySearch}`, {
      method: "POST",
      body: JSON.stringify({
        includedTypes: types,
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: location.lat,
              longitude: location.lng,
            },
            radius: Number(scale),
          },
        },
      }),
      headers: {
        "X-Goog-Api-Key": `${API_KEY}`,
        "X-Goog-FieldMask": `${defaultProperties}`,
        "Content-Type": "application/json",
      },
    });
    //ensures we get a clear error message if error
    //comes from API communication
    if (!response.ok) {
      const error = await response.json();
      console.log("Google API Error: ", error);
      return;
    }
    console.log(response);
    const { places } = await response.json();
    console.log(places);
    places.forEach((element) => {
      try {
        createBusiness(element);
      } catch (err) {
        console.log(err);
      }
    });
    return places;
  } catch (err) {
    console.log(err);
  }
}
