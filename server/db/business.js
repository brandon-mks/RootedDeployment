import { dummyData } from "./db_dummy_data.js";
import client from "./client.js";
import { v4 as uuidv4 } from "uuid";

const {
  restaurants,
  museums,
  hiking_areas,
  book_stores,
  farmers_markets,
  live_music_venues,
} = dummyData;

export const createBusiness = async (place) => {
// Store Google types on the shared business record instead of creating
// a dynamically named table for every individual business.
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
      rating,
      types,
      primary_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
      place.types ?? [],
      place.primaryType ?? null,
    ]);
    return res.rows[0];
  } catch (err) {
    console.log(err);
  }
};

export const getBusinesses = async ({ limit } = {}) => {
  const values = [];

  let SQL = `
    SELECT
      id,
      business_id,
      business_name,
      address,
      phone_number,
      overview,
      link,
      email,
      rating
    FROM businesses
    ORDER BY business_name
  `;

  if (limit !== undefined) {
    values.push(limit);
    SQL += ` LIMIT $1`;
  }

  SQL += `;`;

  const res = await client.query(SQL, values);

  return res.rows;
};

export const getBusinessById = async (businessId) => {
  const SQL = `
    SELECT
      id,
      business_id,
      business_name,
      address,
      phone_number,
      overview,
      link,
      email,
      rating
    FROM businesses
    WHERE business_id = $1;
  `;

  const { rows } = await client.query(SQL, [businessId]);

  return rows[0] ?? null;
};

/**
 * Seed the businesses table using the temporary fixture dataset.
 *
 * Object.values(dummyData).flat() combines every category into one array.
 * Promise.all() ensures all database inserts finish before seeding completes.
 *
 * Replace this fixture source with live API data in the future.
 */

export async function seedDummyData() {
  for (const restaurant of restaurants) {
    await createBusiness(restaurant);
  }

  for (const museum of museums) {
    await createBusiness(museum);
  }

  for (const hikingArea of hiking_areas) {
    await createBusiness(hikingArea);
  }

  for (const bookStore of book_stores) {
    await createBusiness(bookStore);
  }

  for (const farmersMarket of farmers_markets) {
    await createBusiness(farmersMarket);
  }

  for (const liveMusicVenue of live_music_venues) {
    await createBusiness(liveMusicVenue);
  }
  console.log("businesses table successfully seeded");
}