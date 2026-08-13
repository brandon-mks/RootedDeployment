import client from "./client.js";
import { v4 } from "uuid";

//this is our static initial dataset
import { dummyData } from "./db_dummy_data.js";
import { seedDummyData } from "./business.js";

const uuidv4 = v4;

const seed = async () => {
  const SQL = `
  DROP TABLE IF EXISTS businesses CASCADE;

  CREATE TABLE businesses(
    id UUID,
    business_id VARCHAR(100) NOT NULL PRIMARY KEY,
    business_name VARCHAR(100) NOT NULL,
    address VARCHAR(500),
    phone_number VARCHAR(30),
    overview VARCHAR(1000),
    link VARCHAR(500),
    email VARCHAR(100),
    rating DECIMAL
    );
  `;

  /** CREATE TABLE
   * tags[] --> new table
   * events[]: {} --> new table
   * reviews/ratings --> new table
   *
   * calender[] --> not table but a component
   *
   * tier 2:
   * password VARCHAR(50), --
   * profile photo, --
   *  ----> w/business accounts feature
   * comments,
   * images,
   */

  try {
    await client.query(SQL);
    console.log("table/schema created");
  } catch (err) {
    console.log(err);
  }

  try {
    await seedDummyData();
  } catch (err) {
    console.log(err);
  }

  /**
   * if businesses table is populated
   * we return all the business_ids and
   * then filter through the data to
   * get all of each business' types
   * with live data, which will be a separate
   * API call to Place Details
   * */
  const rowsExist = async () => {
    const getIdSQL = `
    SELECT business_id FROM businesses;`;
    //checks rows and returns them if populated
    try {
      const { rows } = await client.query(getIdSQL);
      if (rows.length > 1) {
        return rows;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
    }
  };

  //creates a table for each business using ids
  async function createBusTable(business_ids) {
    await business_ids.map(async (bus_id) => {
      const { business_id } = bus_id;
      /**backslashes necessary to escape backticks
       * and add double quotes to wrap business_id
       * NOTE: some business_ids have a "-" in them
       * which confuses SQL as a subtraction operator
       * sometimes. to fetch from google API all ids
       * must be exactly the same (all string casing
       * and internal symbols)
       * DEBUGGING: when saving, the prettier extension
       * has, at times, changed the template literal.
       * please ensure all references to business_ids
       * within sql have the following syntax:
       * \"${business_id}\"
       */
      const SQL = `
        DROP TABLE IF EXISTS \"${business_id}\";

        CREATE TABLE \"${business_id}\"(
          business_id VARCHAR(100) NOT NULL,
          tags VARCHAR(150) NOT NULL PRIMARY KEY,
          primary_type BOOLEAN,
          FOREIGN KEY (business_id) REFERENCES businesses(business_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
          );
        `;
      try {
        const response = await client.query(SQL);
      } catch (err) {
        console.log(err);
      }
    });
  }

  //for each type within the place.types array
  //insert a row into that place's associated
  //table in the database with that unique type
  //and if it is the primary_type, then set the
  //primary_type column within that row to true
  async function insertTypes(place) {
    place.types.map(async (type) => {
      let primary = null;
      if (place.primaryType == type) {
        primary = true;
      }
      /**see previous note comment within
       * createBusTable business_ids.map
       * ensure place.id has the following
       * syntax: \"${business_id}\" -->
       * AKA \"${place.id}\"
       */
      const SQL = `
      INSERT INTO \"${place.id}\" (
      business_id,
      tags,
      primary_type
      )
      VALUES ($1, $2, $3)
      RETURNING *;
      `;
      try {
        const response = await client.query(SQL, [place.id, type, primary]);
        return response.rows;
      } catch (err) {
        console.log(err);
      }
    });
  }

  if (await rowsExist()) {
    const combined = [
      ...dummyData.book_stores,
      ...dummyData.farmers_markets,
      ...dummyData.hiking_areas,
      ...dummyData.live_music_venues,
      ...dummyData.museums,
      ...dummyData.restaurants,
    ];
    const businesses = await rowsExist();
    /**rowsExist returns an array of all business ids
     * from the businesses table which we pass
     * in to createBusTable to create a table
     * for each business
     */
    await createBusTable(businesses).then(await combined.map((place) => insertTypes(place)));
  }
};

export default seed;
