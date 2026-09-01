import client from "./client.js";
import { seedDummyData } from "./business.js";
import { seedConnectOpportunities } from "./connectOpportunities.js";

/**
 * Create the local development schema and seed it with fixture data.
 *
 * The fixture file is temporary and should eventually be replaced by
 * a controlled import from Google Places or another approved source.
 */
const seed = async () => {
  // DROP TABLE IF EXISTS businesses CASCADE;
  const schemaSQL = `
    DROP TABLE IF EXISTS business_tags CASCADE;
    DROP TABLE IF EXISTS locations CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS favorite_businesses CASCADE;
    DROP TABLE IF EXISTS favorite_events CASCADE;
    DROP TABLE IF EXISTS business_visits CASCADE;
    DROP TABLE IF EXISTS events CASCADE;
    DROP TABLE IF EXISTS event_attendance CASCADE;

    CREATE TABLE businesses (
      id UUID UNIQUE DEFAULT gen_random_UUID() NOT NULL,
      business_id VARCHAR(100) PRIMARY KEY,
      business_name VARCHAR(100) NOT NULL,
      address VARCHAR(500),
      phone_number VARCHAR(30),
      overview TEXT,
      link VARCHAR(100),
      email VARCHAR(100),
      rating DECIMAL,
      primary_tag VARCHAR(150) NOT NULL
    );

    CREATE TABLE business_tags (
      id UUID UNIQUE PRIMARY KEY REFERENCES businesses(id),
      business_id VARCHAR(100) REFERENCES businesses(business_id) ON DELETE CASCADE,
      tags VARCHAR(100) NOT NULL,
      UNIQUE(business_id, tags)
    );

    CREATE TABLE locations (
      id UUID UNIQUE PRIMARY KEY REFERENCES business(id),
      business_id VARCHAR(100) REFERENCES businesses(business_id) ON DELETE CASCADE,
      latitude DOUBLE PRECISION NOT NULL, 
      longitude DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE hours (
      id UUID UNIQUE PRIMARY KEY REFERENCES businesses(id),
      business_id VARCHAR(100) REFERENCES businesses(business_id) ON DELETE CASCADE,
      mon_open TIME,
      mon_close TIME,
      tues_open TIME,
      tues_close TIME,
      wed_open TIME,
      wed_close TIME,
      thurs_open TIME,
      thurs_close TIME,
      fri_open TIME,
      fri_close TIME,
      sat_open TIME,
      sat_close TIME,
      sun_open TIME,
      sun_close TIME
    );

    CREATE TABLE users (
      id UUID PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      avatar_url TEXT,
      role VARCHAR(20) NOT NULL DEFAULT 'member',

      CONSTRAINT users_role_check
        CHECK (role IN ('member', 'admin'))
    );

    CREATE TABLE events (
      id UUID PRIMARY KEY,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
      kind VARCHAR(50) NOT NULL DEFAULT 'community_events',
      title VARCHAR(150) NOT NULL,
      description TEXT,
      venue VARCHAR(200),
      location TEXT,
      city VARCHAR(100),
      region VARCHAR(100),
      country VARCHAR(100),
      time_zone VARCHAR(100),
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      event_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      image_url TEXT,
      is_free BOOLEAN NOT NULL DEFAULT FALSE,
      is_demo BOOLEAN NOT NULL DEFAULT FALSE,

      moderation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      moderation_note TEXT,
      moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
      moderated_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT events_moderation_status_check
        CHECK (
          moderation_status IN (
            'pending',
            'approved',
            'rejected'
          )
        )
    );

    CREATE TABLE favorite_businesses (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

      UNIQUE(user_id, business_id)
    );

    CREATE TABLE favorite_events (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

      UNIQUE(user_id, event_id)
    );

    CREATE TABLE business_visits (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

      UNIQUE(user_id, business_id)
    );

    CREATE TABLE event_attendance (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

      UNIQUE(user_id, event_id)
    );
  `;

  await client.query(schemaSQL);
  console.log("table/schema created");

  await seedDummyData();
  await seedConnectOpportunities();

  /*
   * Rooted-controlled demo events are trusted fixture records.
   * User-created events retain the default pending status.
   */
  
  await client.query(`
    UPDATE events
    SET
      moderation_status = 'approved',
      moderated_at = NOW(),
      updated_at = NOW()
    WHERE is_demo = TRUE;
  `);

  console.log("demo events marked as approved");
};

export default seed;

/**
 * Planned schema additions:
 * - Rooted tags and business/event tag relationships
 * - User comments and expanded moderation history
 *
 * External calendar integration will be implemented through event data
 * and calendar exports/links, not as a standalone calendar table.
 */