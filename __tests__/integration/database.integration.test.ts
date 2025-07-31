import {
  testDb,
  setupIntegrationTest,
  teardownIntegrationTest,
  createTestBookingData,
} from '../setup/test-db'

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    await setupIntegrationTest()
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  it('should create, read, update and delete a booking', async () => {
    const data = createTestBookingData()
    const created = await testDb.booking.create({ data })
    expect(created).toHaveProperty('id')

    const found = await testDb.booking.findUnique({ where: { id: created.id } })
    expect(found).toBeTruthy()
    expect(found?.email).toBe(data.email)

    const updated = await testDb.booking.update({
      where: { id: created.id },
      data: { name: 'Updated Name' },
    })
    expect(updated.name).toBe('Updated Name')

    const deleted = await testDb.booking.delete({ where: { id: created.id } })
    expect(deleted.id).toBe(created.id)
  })

  it('should rollback transaction on error', async () => {
    const data = createTestBookingData()
    let txId: string | undefined

    try {
      await testDb.$transaction(async tx => {
        const record = await tx.booking.create({ data })
        txId = record.id
        throw new Error('force rollback')
      })
    } catch {
      // expected rollback
    }

    if (txId) {
      const exists = await testDb.booking.findUnique({ where: { id: txId } })
      expect(exists).toBeNull()
    }
  })
})
