import pg from "pg";
const client = new pg.Client(process.env.DATABASE_URL || "postgres://localhost/rooted_database");
export default client;
