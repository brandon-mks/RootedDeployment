import pg from "pg";
const client = new pg.Client(
  process.env.EXTERNAL_DATABASE || process.env.DATABASE_URL || "postgres://localhost/rooted",
);
export default client;
