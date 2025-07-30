jest.resetModules()

jest.mock('@/lib/generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}))

import { prisma } from '@/lib/prisma'
import { PrismaClient } from '@/lib/generated/prisma'

describe('prisma client instance', () => {
  it('creates a new PrismaClient with expected config', () => {
    expect(PrismaClient).toHaveBeenCalledWith({ log: ['query'] })
    expect(prisma).toMatchObject({
      $connect: expect.any(Function),
      $disconnect: expect.any(Function),
    })
  })

  it('reuses global prisma instance in non-production', () => {
    process.env.NODE_ENV = 'development'
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { prisma: prisma2 } = require('@/lib/prisma')
    expect(prisma2).toBe(prisma)
  })
})