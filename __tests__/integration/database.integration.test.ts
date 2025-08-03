 // @ts-nocheck
 /* eslint-disable @typescript-eslint/no-explicit-any */
import { testDb } from '../setup/test-db'
import { createTestBookingData } from '../setup/test-db-data'

describe('Database Mock Tests', () => {
  it('should create, read, update and delete a booking', async () => {
    const data = createTestBookingData()
    const booking: any = { ...data, id: '1', createdAt: new Date(), updatedAt: new Date(), status: 'PENDING', sessionDuration: null }

    testDb.booking.create.mockResolvedValue(booking as any)
    const created = await testDb.booking.create({ data })
    expect(created).toHaveProperty('id')

    testDb.booking.findUnique.mockResolvedValue(booking as any)
    const found = await testDb.booking.findUnique({ where: { id: created.id } })
    expect(found).toBeTruthy()
    expect(found?.email).toBe(data.email)

    const updatedBooking: any = { ...booking, name: 'Updated Name' }
    testDb.booking.update.mockResolvedValue(updatedBooking as any)
    const updated = await testDb.booking.update({
      where: { id: created.id },
      data: { name: 'Updated Name' },
    })
    expect(updated.name).toBe('Updated Name')

    testDb.booking.delete.mockResolvedValue(booking as any)
    const deleted = await testDb.booking.delete({ where: { id: created.id } })
    expect(deleted.id).toBe(created.id)
  })
})
