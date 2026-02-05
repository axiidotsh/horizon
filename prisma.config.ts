import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' });
}

export default defineConfig({
  schema: 'src/server/db/schema.prisma',
  migrations: {
    path: 'src/server/db/migrations',
    seed: 'tsx src/server/db/seed.ts',
  },
  datasource: {
    url: env('DIRECT_URL'),
  },
});
