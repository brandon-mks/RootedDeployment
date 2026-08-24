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
  const schemaSQL = `
    DROP TABLE IF EXISTS business_types CASCADE;
    DROP TABLE IF EXISTS types CASCADE;
    DROP TABLE IF EXISTS event_attendance CASCADE;
    DROP TABLE IF EXISTS business_visits CASCADE;
    DROP TABLE IF EXISTS favorite_events CASCADE;
    DROP TABLE IF EXISTS favorite_businesses CASCADE;
    DROP TABLE IF EXISTS events CASCADE;
    DROP TABLE IF EXISTS businesses CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    CREATE TABLE businesses (
      id UUID UNIQUE NOT NULL,
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

    CREATE TABLE users (
      id UUID PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      avatar_url TEXT
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
