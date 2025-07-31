import { PrismaClient } from '@/lib/generated/prisma'
import { mockDeep, mockReset } from 'jest-mock-extended'
import { DeepMockProxy } from 'jest-mock-extended'

const prismaMock = mockDeep<PrismaClient>()

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMockTyped: DeepMockProxy<PrismaClient> = prismaMock
export default prismaMock