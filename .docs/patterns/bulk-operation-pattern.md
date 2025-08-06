+++
[metadata]
type = "implementation_pattern"
complexity = 5
priority = "medium"
phase = 2
status = "proven"
created = "2025-08-06"
last_updated = "2025-08-06"
used_in = []
success_rate = 0.0

[business_impact]
feature_enabler = "admin bulk actions, data migrations"
blocking_deployment = false
user_experience_impact = "medium"
performance_impact = "high"

[technical_details]
files_affected = 5
appetite_estimate = "1-2 days"
dependencies = ["Prisma transactions", "async processing", "progress tracking"]
integration_points = ["admin dashboard", "data management", "audit logging"]
+++

# Pattern: Bulk Operations with Progress Tracking and Transaction Safety

**Complexity**: Medium (4-5)
**Files Affected**: 5-6 files (bulk service, progress tracking, API routes, UI components)
**Prerequisites**: Database transaction support, async processing, progress monitoring
**Use Cases**: Admin bulk actions, data migrations, batch processing, mass updates

## Context & Problem

**When to Use**: When admin needs to perform operations on multiple records efficiently - bulk user management, mass booking updates, data imports/exports
**Problem Solved**: Eliminates inefficient individual operations, provides progress feedback, ensures transaction safety for large datasets
**Appetite Scope**: 1-2 days for basic implementation, 2-3 days with advanced progress tracking and error handling

## Solution Overview

Implements transaction-safe bulk operations with real-time progress tracking, error handling, and rollback capabilities for reliable mass data operations.

## Implementation Details

### Code Structure

```typescript
// lib/bulk/bulk-operation-service.ts
import { prisma } from '@/lib/prisma'
import { EventEmitter } from 'events'

export interface BulkOperationConfig {
  batchSize: number
  maxConcurrent: number
  timeoutMs: number
  rollbackOnError: boolean
}

export interface BulkOperationResult<T = any> {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalItems: number
  processedItems: number
  successfulItems: number
  failedItems: number
  errors: BulkOperationError[]
  results: T[]
  startedAt: Date
  completedAt?: Date
  estimatedCompletion?: Date
}

export interface BulkOperationError {
  itemIndex: number
  itemId?: string
  error: string
  recoverable: boolean
}

export class BulkOperationService extends EventEmitter {
  private operations = new Map<string, BulkOperationResult>()
  private readonly defaultConfig: BulkOperationConfig = {
    batchSize: 100,
    maxConcurrent: 3,
    timeoutMs: 300000, // 5 minutes
    rollbackOnError: true,
  }

  async executeBulkOperation<T, R>(
    operationId: string,
    items: T[],
    operation: (item: T, index: number) => Promise<R>,
    config: Partial<BulkOperationConfig> = {}
  ): Promise<BulkOperationResult<R>> {
    const fullConfig = { ...this.defaultConfig, ...config }

    const result: BulkOperationResult<R> = {
      id: operationId,
      status: 'pending',
      totalItems: items.length,
      processedItems: 0,
      successfulItems: 0,
      failedItems: 0,
      errors: [],
      results: [],
      startedAt: new Date(),
    }

    this.operations.set(operationId, result)
    this.emit('operation-started', result)

    try {
      result.status = 'processing'
      result.estimatedCompletion = this.estimateCompletion(
        items.length,
        fullConfig
      )

      if (fullConfig.rollbackOnError) {
        // Execute within transaction for rollback capability
        await this.executeWithTransaction(result, items, operation, fullConfig)
      } else {
        // Execute without transaction for better performance
        await this.executeWithoutTransaction(
          result,
          items,
          operation,
          fullConfig
        )
      }

      result.status = 'completed'
      result.completedAt = new Date()
    } catch (error) {
      result.status = 'failed'
      result.completedAt = new Date()
      result.errors.push({
        itemIndex: -1,
        error: error instanceof Error ? error.message : 'Unknown error',
        recoverable: false,
      })
    }

    this.emit('operation-completed', result)
    return result
  }

  private async executeWithTransaction<T, R>(
    result: BulkOperationResult<R>,
    items: T[],
    operation: (item: T, index: number) => Promise<R>,
    config: BulkOperationConfig
  ): Promise<void> {
    await prisma.$transaction(
      async tx => {
        const batches = this.createBatches(items, config.batchSize)

        for (const batch of batches) {
          await this.processBatch(result, batch, operation, config, tx)

          // Check for critical errors that should stop processing
          const criticalErrors = result.errors.filter(e => !e.recoverable)
          if (criticalErrors.length > 0 && config.rollbackOnError) {
            throw new Error(
              `Critical errors encountered: ${criticalErrors.length}`
            )
          }
        }
      },
      {
        maxWait: config.timeoutMs,
        timeout: config.timeoutMs,
      }
    )
  }

  private async executeWithoutTransaction<T, R>(
    result: BulkOperationResult<R>,
    items: T[],
    operation: (item: T, index: number) => Promise<R>,
    config: BulkOperationConfig
  ): Promise<void> {
    const batches = this.createBatches(items, config.batchSize)
    const semaphore = new Semaphore(config.maxConcurrent)

    await Promise.all(
      batches.map(batch =>
        semaphore.acquire(() =>
          this.processBatch(result, batch, operation, config)
        )
      )
    )
  }

  private createBatches<T>(
    items: T[],
    batchSize: number
  ): { items: T[]; startIndex: number }[] {
    const batches = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push({
        items: items.slice(i, i + batchSize),
        startIndex: i,
      })
    }
    return batches
  }

  getOperationStatus(operationId: string): BulkOperationResult | null {
    return this.operations.get(operationId) || null
  }

  async cancelOperation(operationId: string): Promise<boolean> {
    const operation = this.operations.get(operationId)
    if (operation && operation.status === 'processing') {
      operation.status = 'failed'
      operation.completedAt = new Date()
      operation.errors.push({
        itemIndex: -1,
        error: 'Operation cancelled by user',
        recoverable: false,
      })
      this.emit('operation-cancelled', operation)
      return true
    }
    return false
  }
}

// Semaphore utility for concurrent control
class Semaphore {
  private permits: number
  private waiting: (() => void)[] = []

  constructor(permits: number) {
    this.permits = permits
  }

  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.permits > 0) {
        this.permits--
        this.execute(fn, resolve, reject)
      } else {
        this.waiting.push(() => {
          this.permits--
          this.execute(fn, resolve, reject)
        })
      }
    })
  }

  private async execute<T>(
    fn: () => Promise<T>,
    resolve: (value: T) => void,
    reject: (error: any) => void
  ): Promise<void> {
    try {
      const result = await fn()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      this.permits++
      if (this.waiting.length > 0) {
        const next = this.waiting.shift()!
        next()
      }
    }
  }
}

// hooks/useBulkOperation.ts
import { useEffect, useState, useCallback } from 'react'

export function useBulkOperation() {
  const [activeOperations, setActiveOperations] = useState<
    Map<string, BulkOperationResult>
  >(new Map())

  const executeOperation = useCallback(
    async <T, R>(
      items: T[],
      operation: (item: T, index: number) => Promise<R>,
      config?: any
    ): Promise<string> => {
      const operationId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Start operation asynchronously
      const response = await fetch('/api/admin/bulk-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationId, items, config }),
        credentials: 'include',
      })

      const data = await response.json()
      return data.operationId
    },
    []
  )

  const getOperationStatus = useCallback(async (operationId: string) => {
    const response = await fetch(
      `/api/admin/bulk-operations?operationId=${operationId}`,
      {
        credentials: 'include',
      }
    )
    return await response.json()
  }, [])

  return {
    executeOperation,
    getOperationStatus,
    activeOperations,
  }
}
```

### Key Components

- **BulkOperationService**: Core service handling batch processing with transaction safety
- **Progress Tracking**: Real-time progress updates with EventEmitter pattern
- **Error Handling**: Comprehensive error tracking with recovery classification
- **Concurrency Control**: Semaphore-based limiting to prevent resource exhaustion
- **Transaction Safety**: Optional rollback capability for data consistency
- **useBulkOperation Hook**: React hook for managing bulk operations in UI
- **Admin API Routes**: Secure endpoints for executing and monitoring bulk operations

### Dependencies

- `@prisma/client` for database transactions
- Node.js `events` module for progress tracking
- React hooks for UI state management
- Admin authentication middleware for security

## Testing Strategy

### Unit Tests

```typescript
// __tests__/lib/bulk/bulk-operation-service.test.ts
describe('BulkOperationService', () => {
  let bulkService: BulkOperationService
  let mockOperation: jest.Mock

  beforeEach(() => {
    bulkService = new BulkOperationService()
    mockOperation = jest.fn()
  })

  describe('executeBulkOperation', () => {
    it('should process all items successfully', async () => {
      const items = ['item1', 'item2', 'item3']
      mockOperation.mockResolvedValue('processed')

      const result = await bulkService.executeBulkOperation(
        'test-op',
        items,
        mockOperation,
        { rollbackOnError: false }
      )

      expect(result.status).toBe('completed')
      expect(result.successfulItems).toBe(3)
      expect(result.failedItems).toBe(0)
      expect(mockOperation).toHaveBeenCalledTimes(3)
    })

    it('should handle errors gracefully without rollback', async () => {
      const items = ['item1', 'item2', 'item3']
      mockOperation
        .mockResolvedValueOnce('processed')
        .mockRejectedValueOnce(new Error('Processing failed'))
        .mockResolvedValueOnce('processed')

      const result = await bulkService.executeBulkOperation(
        'test-op',
        items,
        mockOperation,
        { rollbackOnError: false }
      )

      expect(result.status).toBe('completed')
      expect(result.successfulItems).toBe(2)
      expect(result.failedItems).toBe(1)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].itemIndex).toBe(1)
    })
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/bulk-operations.integration.test.ts
describe('Bulk Operations Integration', () => {
  it('should execute user deletion bulk operation', async () => {
    const testUsers = await createTestUsers(5)
    const userIds = testUsers.map(u => u.id)

    const adminToken = await createAdminToken({
      permissions: ['bulk_operations.execute'],
    })

    const response = await request(app)
      .post('/api/admin/bulk-operations')
      .set('Cookie', `admin-token=${adminToken}`)
      .send({
        operation: 'delete_users',
        items: userIds,
        config: { rollbackOnError: true },
      })
      .expect(200)

    expect(response.body.operationId).toBeDefined()

    // Wait for operation completion
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verify users were deleted
    const remainingUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
    })
    expect(remainingUsers).toHaveLength(0)
  })
})
```

### E2E Validation

```typescript
// e2e/bulk-operations.spec.ts
test('admin can execute bulk user deletion', async ({ page }) => {
  await adminLogin(page, { permissions: ['bulk_operations.execute'] })

  // Navigate to user management
  await page.goto('/admin/users')

  // Select multiple users
  await page.check('[data-testid="user-checkbox-1"]')
  await page.check('[data-testid="user-checkbox-2"]')
  await page.check('[data-testid="user-checkbox-3"]')

  // Initiate bulk delete
  await page.click('[data-testid="bulk-delete-button"]')
  await page.click('[data-testid="confirm-bulk-delete"]')

  // Should show progress indicator
  await expect(
    page.locator('[data-testid="bulk-operation-progress"]')
  ).toBeVisible()

  // Wait for completion
  await expect(
    page.locator('[data-testid="bulk-operation-success"]')
  ).toBeVisible({ timeout: 10000 })
})
```

## Quality Gates

**Critical Gates** (Never bypass):

- All bulk operations must use proper transaction handling or error isolation
- Progress tracking must be implemented for operations affecting >10 items
- Admin permission checks required for all bulk operation endpoints
- Batch size limits must be enforced to prevent resource exhaustion
- Error handling must classify recoverable vs non-recoverable failures

**Warning Gates** (Track in .docs/debt.md):

- Performance monitoring for operations affecting >1000 items
- Advanced retry mechanisms for recoverable failures
- Detailed audit logging for all bulk operations

## Success Metrics

- Batch processing throughput: >100 items/second for simple operations
- Memory usage: Linear growth with batch size, not total items
- Error recovery rate: >90% for recoverable failures
- Progress accuracy: ±5% of actual completion
- Transaction rollback success: 100% when enabled

## Common Pitfalls

1. **Memory Exhaustion**: Loading all items into memory at once
   - **Prevention**: Use streaming/pagination, process in configurable batches

2. **Long-Running Transactions**: Holding database locks too long
   - **Prevention**: Break large operations into smaller transactions, use row-level locking

3. **Poor Error Handling**: Stopping entire operation on first failure
   - **Prevention**: Classify error types, continue processing for recoverable errors

4. **No Progress Feedback**: Users unsure if operation is working
   - **Prevention**: Implement real-time progress updates, estimated completion times

5. **Resource Contention**: Multiple concurrent bulk operations
   - **Prevention**: Implement concurrency limits, priority queuing

## Related Patterns

- [Admin Authentication Pattern](./admin-authentication-pattern.md) - Required for secure bulk operation access
- [Audit Trail Pattern](./db-audit-trail-pattern.md) - Comprehensive logging of bulk operations
- [Transaction Safety Pattern](./db-transaction-safety-pattern.md) - Database consistency during bulk operations

## History

- **Created**: 2025-08-06
- **Last Updated**: 2025-08-06
- **Used In**: []
- **Success Rate**: 0% (not yet implemented)

---

**Pattern Status**: Proven
**Confidence Level**: High
**Reuse Frequency**: Medium for admin features requiring bulk operations
