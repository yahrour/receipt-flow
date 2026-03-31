import { Pool } from "pg";
import { env } from "../config/env.js";

const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

pool.on("error", (e) => {
  console.log("db error: ", e);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const query = (query: string, params?: any[]) =>
  pool.query(query, params);
