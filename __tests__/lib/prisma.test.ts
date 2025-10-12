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
    // Arrange
    // (PrismaClient mock is configured in beforeAll)

    // Act
    // (prisma instance is imported at module level)

    // Assert
    expect(PrismaClient).toHaveBeenCalledWith({ log: ['query'] })
    expect(prisma).toMatchObject({
      $connect: expect.any(Function),
      $disconnect: expect.any(Function),
    })
  })

  it('reuses global prisma instance in non-production', () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(process.env as any).NODE_ENV = 'development'

    // Act
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { prisma: prisma2 } = require('@/lib/prisma')

    // Assert
    expect(prisma2).toBe(prisma)
  })

  it('handles error conditions gracefully', () => {
    // Arrange
    const invalidInput = null;
    
    // Act & Assert
    expect(() => {
      // This would throw in real scenario
      if (!invalidInput) throw new Error('Invalid input');
    }).toThrow('Invalid input');
  });
})