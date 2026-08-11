import client from "./client.js";
import { v4 } from "uuid";

//this is our static initial dataset
import { dummyData } from "./db_dummy_data.js";
import { seedDummyData } from "./business.js";

const uuidv4 = v4;

const seed = async () => {
  const SQL = `
  DROP TABLE IF EXISTS businesses;

  CREATE TABLE businesses(
    id UUID PRIMARY KEY,
    business_id VARCHAR(100),
    email VARCHAR(100),
    phone_number VARCHAR(30),
    business_name VARCHAR(100) NOT NULL,
    address VARCHAR(500),
    overview VARCHAR(1000),
    link VARCHAR(500),
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
};

export default seed;
