import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Prisma 7 connects via a driver adapter instead of a schema `url`. The pg pool
// is created lazily, so constructing this at import time never opens a
// connection (safe for `next build` and tests with a placeholder/empty URL).
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_POSTGRES_PRISMA_URL ?? '',
})

// Factory for routes that construct their own client (Prisma 7 requires the
// adapter to be passed explicitly). Centralised so the adapter wiring lives in
// one place.
export function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter,
    log: ['query'],
  })
}

export const prisma = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
