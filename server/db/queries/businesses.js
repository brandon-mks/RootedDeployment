import client from "../client.js";
import { v4 as uuidv4 } from "uuid";
import { fetchPlaces } from "../../googleAPIs/placesAPI.js";

export const createBusiness = async (place) => {
  // Store Google types on the shared business record instead of creating
  // a dynamically named table for every individual business.
  const SQL = `
      INSERT INTO businesses (
      business_id,
      business_name,
      address,
      phone_number,
      overview,
      link,
      email,
      rating,
      primary_tag
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
      `;
  try {
    const res = await client.query(SQL, [
      place.id,
      place.displayName.text,
      place.formattedAddress,
      place.internationalPhoneNumber,
      place.editorialSummary,
      place.websiteUri,
      null,
      place.rating,
      place.primaryType
    ]);
    return res.rows[0];
  } catch (err) {
    console.log(err);
  }
};

export const getBusinesses = async () => {

  let SQL = `
    SELECT *
    FROM businesses
    ORDER BY business_name
    LIMIT 15;
  `

  const res = await client.query(SQL);

  return res.rows;
};

export const getBusinessById = async (businessId) => {
  const SQL = `
    SELECT businesses.business_id,
    businesses.business_name,
    businesses.address,
    businesses.phone_number,
    businesses.overview,
    businesses.link,
    businesses.rating,
    businesses.primary_tag
    FROM businesses
    WHERE business_id = ''$1'';
  `;

  const { rows } = await client.query(SQL, [businessId]);

  return rows[0] ?? null;
};

/**Future/Stretch Goal:
 * This function's internal code will be replaced to
 * query the DB with saved places data and include
 * internal distance equations.
 */
export async function getBusByLocTag(location, tags) {
    try {
        const res = await fetchPlaces(location, tags);
        return res;
    } catch(err) {
        console.log(err);
        return err;
    }
}

/**Early scaffolding for including 
 * distance calculations internally */
/*
export async function getBusByLocTag(location, tags) {
    const SQL = `
    SELECT
    businesses.business_id,
    businesses.business_name,
    businesses.address,
    businesses.phone_number,
    businesses.overview,
    businesses.link,
    businesses.rating,
    businesses.primary_tag,
    locations.latitude,
    locations.longitude,
    business_tags.tags,
    hours.mon_open,
    hours.mon_close,
    hours.tues_open,
    hours.tues_close,
    hours.wed_open,
    hours.wed_close,
    hours.thurs_open,
    hours.thurs_close,
    hours.fri_open,
    hours.fri_close,
    hours.sat_open,
    hours.sat_close,
    hours.sun_open,
    hours.sun_close,
    FROM businesses
    INNER JOIN locations ON
    businesses.business_id =
    locations.business_id
    INNER JOIN business_tags ON
    businesses.business_id =
    business_tags.business_id
    INNER JOIN hours ON
    businesses.business_id =
    hours.business_id;
    `;
} */