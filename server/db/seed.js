import client from "./client.js";
import { seedDummyData } from "./business.js";

/**
 * Create the local development schema and seed it with fixture data.
 *
 * The fixture file is temporary and should eventually be replaced by
 * a controlled import from Google Places or another approved source.
 */
const seed = async () => {
  const schemaSQL = `
    DROP TABLE IF EXISTS business_types CASCADE;
    DROP TABLE IF EXISTS types CASCADE;
    DROP TABLE IF EXISTS businesses CASCADE;

    CREATE TABLE businesses (
      id UUID NOT NULL,
      business_id VARCHAR(100) PRIMARY KEY,
      business_name VARCHAR(100) NOT NULL,
      address VARCHAR(500),
      phone_number VARCHAR(30),
      overview VARCHAR(1000),
      link VARCHAR(500),
      email VARCHAR(100),
      rating DECIMAL,
      types VARCHAR(150)[] NOT NULL DEFAULT '{}',
      primary_type VARCHAR(150)
    );
  `;
  await client.query(schemaSQL);
  console.log("table/schema created");

  await seedDummyData();
};

export default seed;

/**
 * Planned schema additions:
 * - Rooted tags and business/event tag relationships
 * - Events and saved user events
 * - User comments and moderation fields
 *
 * External calendar integration will be implemented through event data
 * and calendar exports/links, not as a standalone calendar table.
 */