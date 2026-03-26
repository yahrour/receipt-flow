import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.string().transform(Number).default(8080),
  HOST: z.string().default("localhost"),
});

// Validate process.env against the schema
const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Invalid environment variables:",
    JSON.stringify(result.error.format(), null, 2),
  );
  process.exit(1);
}

export const env = result.data;
