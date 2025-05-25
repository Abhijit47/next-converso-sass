import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';

loadEnvConfig(process.cwd(), true);

export default defineConfig({
  schema: ['./database/schemas.ts'],
  out: './database/migrations',
  dialect: 'postgresql',
  // schemaFilter:"public",
  // verbose: true,
  // strict: true,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
