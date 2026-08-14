import client from "./client.js";
import { v4 as uuidv4 } from "uuid";

//this is our static initial dataset
import { dummyData } from "./db_dummy_data.js";
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
      rating DECIMAL
    );

    CREATE TABLE types (
      id UUID PRIMARY KEY,
      type_name VARCHAR(150) UNIQUE NOT NULL
    );

    CREATE TABLE business_types (
      business_id VARCHAR(100) NOT NULL,
      type_id UUID NOT NULL,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,

      PRIMARY KEY (business_id, type_id),

      FOREIGN KEY (business_id)
        REFERENCES businesses(business_id)
        ON DELETE CASCADE,

      FOREIGN KEY (type_id)
        REFERENCES types(id)
        ON DELETE CASCADE
    );
  `;
  await client.query(schemaSQL);
  console.log("table/schema created");

  await seedDummyData();

  const places = Object.values(dummyData).flat();

  for (const place of places) {
    for (const typeName of place.types ?? []) {
      const typeResult = await client.query(
        `
          INSERT INTO types (id, type_name)
          VALUES ($1, $2)
          ON CONFLICT (type_name)
          DO UPDATE SET type_name = EXCLUDED.type_name
          RETURNING id;
        `,
        [uuidv4(), typeName],
      );

      await client.query(
        `
          INSERT INTO business_types (
            business_id,
            type_id,
            is_primary
          )
          VALUES ($1, $2, $3)
          ON CONFLICT (business_id, type_id)
          DO UPDATE SET is_primary = EXCLUDED.is_primary;
        `,
        [place.id, typeResult.rows[0].id, place.primaryType === typeName],
      );
    }
  }

  console.log("business types successfully seeded");
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