// src/lib/env.ts
type EnvConfig = {
  API_BASE_URL: string;
  APP_URL: string;
};

function getEnvVar(key: string, defaultValue?: string): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const value: string = import.meta.env[key];

  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value ?? defaultValue!;
}

export const env: EnvConfig = {
  API_BASE_URL: getEnvVar("VITE_API_BASE_URL"),
  APP_URL: getEnvVar("VITE_APP_URL"),
};
