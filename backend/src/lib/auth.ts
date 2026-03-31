import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { env } from "../config/env.js";

export const auth = betterAuth({
  database: new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
