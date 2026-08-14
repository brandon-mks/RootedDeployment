import { dummyData } from "./db_dummy_data.js";
import client from "./client.js";
import { v4 as uuidv4 } from "uuid";

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
  const places = Object.values(dummyData).flat();

  for (const place of places) {
    await createBusiness(place);
  }

  console.log("businesses table successfully seeded");
}
