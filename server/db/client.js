import "dotenv/config";
import pg from "pg";

const connectionString = process.env.EXTERNAL_DATABASE || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing EXTERNAL_DATABASE or DATABASE_URL environment variable");
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
