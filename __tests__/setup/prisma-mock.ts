import { PrismaClient } from '@/lib/generated/prisma'
import { vi, beforeEach } from 'vitest'

// Create a deep mock for PrismaClient
const createPrismaMock = (): any => ({
  booking: {
    create: vi.fn(),
    createMany: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  bookingStatusChange: {
    create: vi.fn(),
    createMany: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $disconnect: vi.fn(),
  $connect: vi.fn(),
  $transaction: vi.fn(),
})

const prismaMock = createPrismaMock()

// In-memory store for mocked data
let bookingsStore: any[] = []

// @ts-expect-error - Mock implementation simplification
prismaMock.booking.create.mockImplementation(async ({ data }) => {
  const booking = {
    id: `mock-id-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  bookingsStore.push(booking)
  return booking
})

// @ts-expect-error - Mock implementation simplification
prismaMock.booking.createMany.mockImplementation(async ({ data }) => {
  const bookings = data.map((item: any, index: number) => ({
    id: `mock-bulk-${Date.now()}-${index}`,
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))
  bookingsStore.push(...bookings)
  return { count: bookings.length }
})

// @ts-expect-error - Mock implementation simplification
prismaMock.booking.findMany.mockImplementation(async ({ where, orderBy, take }: any = {}) => {
  let results = [...bookingsStore]
  
  if (where?.status) {
    results = results.filter((b: any) => b.status === where.status)
  }
  
  if (orderBy?.createdAt) {
    results.sort((a: any, b: any) => {
      const order = orderBy.createdAt === 'desc' ? -1 : 1
      return (b.createdAt.getTime() - a.createdAt.getTime()) * order
    })
  }
  
  if (take) {
    results = results.slice(0, take)
  }
  
  return results
})

// @ts-expect-error - Mock implementation simplification
prismaMock.booking.findUnique.mockImplementation(async ({ where }) => {
  return bookingsStore.find((b: any) => b.id === where.id) || null
})

// @ts-expect-error - Mock implementation simplification
prismaMock.booking.findFirst.mockImplementation(async ({ where }: any = {}) => {
  if (!where) return bookingsStore[0] || null
  return bookingsStore.find((b: any) => {
    return Object.entries(where).every(([key, value]) => b[key] === value)
  }) || null
})

// @ts-expect-error - Mock implementation simplification
prismaMock.booking.update.mockImplementation(async ({ data, where }) => {
  const index = bookingsStore.findIndex((b: any) => b.id === where.id)
  if (index === -1) throw new Error('Record not found')
  
  bookingsStore[index] = {
    ...bookingsStore[index],
    ...data,
    updatedAt: new Date(),
  }
  return bookingsStore[index]
})

// @ts-expect-error - Mock implementation simplification
prismaMock.booking.delete.mockImplementation(async ({ where }) => {
  const index = bookingsStore.findIndex((b: any) => b.id === where.id)
  if (index === -1) {
    throw new Error('Record not found')
  }
  const deleted = bookingsStore.splice(index, 1)[0]
  return deleted
})

// @ts-expect-error - Mock implementation simplification
prismaMock.booking.count.mockImplementation(async () => {
  return bookingsStore.length
})

beforeEach(() => {
  // Clear the in-memory store and mock call history
  bookingsStore = []
  vi.clearAllMocks()
  
  // Re-setup mock implementations
  // @ts-expect-error - Mock implementation simplification
  prismaMock.booking.create.mockImplementation(async ({ data }) => {
    const booking = {
      id: `mock-id-${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    bookingsStore.push(booking)
    return booking
  })
  
  // @ts-expect-error - Mock implementation simplification
  prismaMock.booking.findMany.mockImplementation(async ({ where, orderBy, take }: any = {}) => {
    let results = [...bookingsStore]
    
    if (where?.status) {
      results = results.filter((b: any) => b.status === where.status)
    }
    
    if (orderBy?.createdAt) {
      results.sort((a: any, b: any) => {
        const order = orderBy.createdAt === 'desc' ? -1 : 1
        return (b.createdAt.getTime() - a.createdAt.getTime()) * order
      })
    }
    
    if (take) {
      results = results.slice(0, take)
    }
    
    return results
  })
  
  // @ts-expect-error - Mock implementation simplification
  prismaMock.booking.findUnique.mockImplementation(async ({ where }) => {
    return bookingsStore.find((b: any) => b.id === where.id) || null
  })
  
  // @ts-expect-error - Mock implementation simplification
  prismaMock.booking.findFirst.mockImplementation(async ({ where }: any = {}) => {
    if (!where) return bookingsStore[0] || null
    return bookingsStore.find((b: any) => {
      return Object.entries(where).every(([key, value]) => b[key] === value)
    }) || null
  })
  
  // @ts-expect-error - Mock implementation simplification
  prismaMock.booking.update.mockImplementation(async ({ data, where }) => {
    const index = bookingsStore.findIndex((b: any) => b.id === where.id)
    if (index === -1) throw new Error('Record not found')
    
    bookingsStore[index] = {
      ...bookingsStore[index],
      ...data,
      updatedAt: new Date(),
    }
    return bookingsStore[index]
  })
  
  // @ts-expect-error - Mock implementation simplification
  prismaMock.booking.delete.mockImplementation(async ({ where }) => {
    const index = bookingsStore.findIndex((b: any) => b.id === where.id)
    if (index === -1) {
      throw new Error('Record not found')
    }
    const deleted = bookingsStore.splice(index, 1)[0]
    return deleted
  })
  
  // @ts-expect-error - Mock implementation simplification
  prismaMock.booking.count.mockImplementation(async () => {
    return bookingsStore.length
  })
})

export const prismaMockTyped: PrismaClient = prismaMock as unknown as PrismaClient
export default prismaMock