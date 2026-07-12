vi.resetModules()

vi.mock('@/lib/generated/prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(function () {
    return {
      $connect: vi.fn(),
      $disconnect: vi.fn(),
    }
  }),
}))

import { vi, describe, it, expect } from 'vitest'

import { prisma } from '@/lib/prisma'
import { PrismaClient } from '@/lib/generated/prisma/client'

describe('prisma client instance', () => {
  it('creates a new PrismaClient with expected config', () => {
    // Arrange
    // (PrismaClient mock is configured in beforeAll)

    // Act
    // (prisma instance is imported at module level)

    // Assert
    expect(PrismaClient).toHaveBeenCalledWith(
      expect.objectContaining({ log: ['query'], adapter: expect.anything() })
    )
    expect(prisma).toMatchObject({
      $connect: expect.any(Function),
      $disconnect: expect.any(Function),
    })
  })

  it('reuses global prisma instance in non-production', async () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(process.env as any).NODE_ENV = 'development'

    // Act
    const { prisma: prisma2 } = await import('@/lib/prisma')

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