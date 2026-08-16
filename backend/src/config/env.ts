import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default(3000),
  HOST: z.string().default("0.0.0.0"),
  BETTER_AUTH_SECRET: z.string().nonempty(),
  BETTER_AUTH_URL: z.url(),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  GEMINI_API_KEY: z.string(),
  FRONTEND_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
});

export type Env = z.infer<typeof envSchema>;

// In test mode we don't require real env vars: tests mock the DB and all
// external services, so a fixed fallback is enough. Reading process.env.NODE_ENV
// directly (unvalidated) avoids an import-order problem where the module tries
// to validate before jest's setup code has run.
const isTest = process.env.NODE_ENV === "test";

const testEnv: Env = {
  NODE_ENV: "test",
  PORT: 3000,
  HOST: "0.0.0.0",
  BETTER_AUTH_SECRET: "test-secret",
  BETTER_AUTH_URL: "http://localhost:3000",
  DB_HOST: "localhost",
  DB_PORT: 5432,
  DB_USER: "test",
  DB_PASSWORD: "test",
  DB_NAME: "test",
  GEMINI_API_KEY: "test-key",
  FRONTEND_URL: "http://localhost:5173",
  GOOGLE_CLIENT_ID: "test",
  GOOGLE_CLIENT_SECRET: "test",
  RESEND_API_KEY: "test",
};

function loadEnv(): Env {
  if (isTest) {
    return testEnv;
  }

  // Validate process.env against the schema
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      "Invalid environment variables:",
      JSON.stringify(result.error.format(), null, 2),
    );
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();
