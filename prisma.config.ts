import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Prisma 7 moves the Migrate/CLI connection URL out of schema.prisma.
// The PrismaClient itself connects via a driver adapter (see lib/prisma.ts).
// Read the URL non-strictly (not prisma/config's `env()`, which throws when
// unset): `prisma generate`/`next build` never connect, and `migrate deploy`
// only runs on Vercel where DATABASE_POSTGRES_PRISMA_URL is set.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_POSTGRES_PRISMA_URL ?? '',
  },
})
