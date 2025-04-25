// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  out: './sql',
  schema: './schemas/*',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
// This file is used to configure the Drizzle ORM for database migrations and schema generation.
