import pg from "pg";

// One pool for the whole app: it keeps a few database connections open and
// lends them to each query, because opening a new connection is slow.
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
