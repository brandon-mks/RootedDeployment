import { dummyData } from "./db_dummy_data.js";
import client from "./client.js";
import { v4 } from "uuid";
const uuidv4 = v4;

const { restaurants, museums, hiking_areas, book_stores, farmers_markets, live_music_venues } =
  dummyData;

export const createBusiness = async (place) => {
  const SQL = `
      INSERT INTO businesses (
      id,
      business_id,
      business_name,
      address,
      phone_number,
      overview,
      link,
      email,
      rating
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
      `;
  try {
    const res = await client.query(SQL, [
      uuidv4(),
      place.id,
      place.displayName.text,
      place.formattedAddress,
      place.internationalPhoneNumber,
      place.editorialSummary,
      place.websiteUri,
      null,
      place.rating,
    ]);
    return res.rows[0];
  } catch (err) {
    console.log(err);
  }
};

/**the following .map(s) will be deleted
 * and replaced with API calls when
 * we switch to live data
 * will look more like:
 *
 * APIReturn.map((place) => {
 * createBusiness(place);
 * });
 *
 */
export async function seedDummyData() {
  await restaurants.map((restaurant) => {
    createBusiness(restaurant);
  });

  await museums.map((museum) => {
    createBusiness(museum);
  });

  await hiking_areas.map((hiking_area) => {
    createBusiness(hiking_area);
  });

  await book_stores.map((book_store) => {
    createBusiness(book_store);
  });

  await farmers_markets.map((farmers_market) => {
    createBusiness(farmers_market);
  });

  await live_music_venues.map((live_music_venue) => {
    createBusiness(live_music_venue);
  });

  console.log("businesses table successfully seeded");
}
