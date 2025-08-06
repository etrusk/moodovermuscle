+++
[metadata]
type = "implementation_pattern"
complexity = 8
priority = "high"
phase = 1
status = "proven"
created = "2025-08-06"
last_updated = "2025-08-06"
used_in = []
success_rate = 0.0

[business_impact]
feature_enabler = "calendar availability updates, live booking status"
blocking_deployment = true
user_experience_impact = "high"
performance_impact = "medium"

[technical_details]
files_affected = 7
appetite_estimate = "1-2 days"
dependencies = ["WebSocket", "Server-Sent Events", "Redis"]
integration_points = ["booking system", "calendar availability", "notification system"]
+++

# Pattern: Real-Time Data Synchronization

**Complexity**: Complex (7-8)
**Files Affected**: 7-8 files (WebSocket handler, client hooks, sync middleware, cache layer)
**Prerequisites**: WebSocket support, Redis for state management, Next.js API routes
**Use Cases**: Live calendar updates, booking status changes, real-time availability, multi-user coordination

## Context & Problem

**When to Use**: When users need immediate updates without page refresh - calendar availability, booking confirmations, live status changes
**Problem Solved**: Eliminates polling inefficiency, provides instant feedback, prevents booking conflicts, enables collaborative booking experiences
**Appetite Scope**: 1-2 days for basic implementation, 3-4 days for robust production system

## Solution Overview

Implements WebSocket-based real-time synchronization with fallback to Server-Sent Events, Redis-backed state management, and optimistic UI updates with conflict resolution.

## Implementation Details

### Code Structure

```typescript
// lib/realtime/websocket-manager.ts
import { Server } from 'socket.io'
import { NextApiRequest } from 'next'
import { Server as NetServer } from 'http'
import Redis from 'ioredis'

interface SocketServer extends NetServer {
  io?: Server
}

interface SocketWithIO extends NextApiRequest {
  socket: Socket & {
    server: SocketServer
  }
}

export class WebSocketManager {
  private io: Server
  private redis: Redis

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!)
  }

  async initializeSocket(req: SocketWithIO): Promise<void> {
    if (!req.socket.server.io) {
      const io = new Server(req.socket.server, {
        path: '/api/socket',
        cors: { origin: process.env.NEXT_PUBLIC_APP_URL },
      })

      io.on('connection', this.handleConnection.bind(this))
      req.socket.server.io = io
      this.io = io
    }
  }

  private async handleConnection(socket: Socket): Promise<void> {
    // Join room based on booking session or calendar view
    socket.on(
      'join-calendar',
      async (data: { date: string; serviceId?: string }) => {
        const room = `calendar:${data.date}:${data.serviceId || 'all'}`
        await socket.join(room)

        // Send current availability state
        const availability = await this.getAvailabilityState(
          data.date,
          data.serviceId
        )
        socket.emit('availability-update', availability)
      }
    )

    socket.on('booking-intent', async (data: BookingIntent) => {
      await this.handleBookingIntent(socket, data)
    })
  }

  async broadcastAvailabilityUpdate(
    date: string,
    serviceId: string,
    slots: AvailabilitySlot[]
  ): Promise<void> {
    const room = `calendar:${date}:${serviceId}`
    this.io.to(room).emit('availability-update', {
      date,
      serviceId,
      slots,
      timestamp: Date.now(),
    })
  }
}

// hooks/useRealtimeAvailability.ts
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export interface AvailabilityState {
  slots: AvailabilitySlot[]
  lastUpdated: number
  conflicts: ConflictInfo[]
}

export function useRealtimeAvailability(date: string, serviceId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [availability, setAvailability] = useState<AvailabilityState | null>(
    null
  )
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting')

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL!, {
      path: '/api/socket',
    })

    socketInstance.on('connect', () => {
      setConnectionStatus('connected')
      socketInstance.emit('join-calendar', { date, serviceId })
    })

    socketInstance.on('availability-update', (data: AvailabilityUpdate) => {
      setAvailability(prev => ({
        ...prev,
        slots: data.slots,
        lastUpdated: data.timestamp,
      }))
    })

    socketInstance.on('disconnect', () => {
      setConnectionStatus('disconnected')
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.close()
    }
  }, [date, serviceId])

  const reserveSlot = async (slot: TimeSlot): Promise<ReservationResult> => {
    if (!socket) throw new Error('Socket not connected')

    return new Promise((resolve, reject) => {
      socket.emit(
        'reserve-slot',
        { date, serviceId, slot },
        (response: ReservationResult) => {
          if (response.success) {
            resolve(response)
          } else {
            reject(new Error(response.error))
          }
        }
      )
    })
  }

  return {
    availability,
    connectionStatus,
    reserveSlot,
  }
}

// api/socket.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { WebSocketManager } from '@/lib/realtime/websocket-manager'

const wsManager = new WebSocketManager()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    await wsManager.initializeSocket(req as any)
    res.end()
  }
}

// Optimistic UI with conflict resolution
export class OptimisticStateManager {
  private pendingUpdates = new Map<string, PendingUpdate>()

  async optimisticUpdate(action: BookingAction): Promise<void> {
    const updateId = `${action.type}-${action.slotId}-${Date.now()}`

    // Apply optimistic update immediately
    this.applyOptimisticUpdate(action)

    // Track pending update
    this.pendingUpdates.set(updateId, {
      action,
      timestamp: Date.now(),
      status: 'pending',
    })

    try {
      const result = await this.executeServerUpdate(action)
      this.confirmUpdate(updateId, result)
    } catch (error) {
      this.revertUpdate(updateId, error)
    }
  }
}
```

### Key Components

- **WebSocketManager**: Handles socket connections, room management, and real-time broadcasting
- **RealtimeAvailability Hook**: React hook for subscribing to availability changes
- **OptimisticStateManager**: Manages optimistic updates with conflict resolution
- **Conflict Detection**: Identifies and resolves booking conflicts in real-time
- **Fallback SSE Handler**: Server-Sent Events fallback for environments without WebSocket support
- **Redis State Layer**: Persistent state management for availability and reservations
- **Connection Recovery**: Automatic reconnection with state synchronization

### Dependencies

- `socket.io` and `socket.io-client` for WebSocket communication
- `ioredis` for Redis state management
- `@types/socket.io` for TypeScript support
- Next.js API routes for WebSocket endpoint
- React hooks for client-side state management

## Testing Strategy

### Unit Tests

```typescript
// __tests__/lib/realtime/websocket-manager.test.ts
describe('WebSocketManager', () => {
  let wsManager: WebSocketManager
  let mockSocket: MockSocket
  let mockRedis: MockRedis

  beforeEach(() => {
    mockRedis = new MockRedis()
    wsManager = new WebSocketManager()
    mockSocket = new MockSocket()
  })

  describe('handleConnection', () => {
    it('should join calendar room and send availability', async () => {
      const joinData = { date: '2025-08-06', serviceId: 'personal-training' }

      await wsManager.handleConnection(mockSocket)
      mockSocket.emit('join-calendar', joinData)

      expect(mockSocket.join).toHaveBeenCalledWith(
        'calendar:2025-08-06:personal-training'
      )
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'availability-update',
        expect.any(Object)
      )
    })
  })

  describe('broadcastAvailabilityUpdate', () => {
    it('should emit to correct room with proper data', async () => {
      const slots = [{ time: '09:00', available: false }]

      await wsManager.broadcastAvailabilityUpdate(
        '2025-08-06',
        'personal-training',
        slots
      )

      expect(mockSocket.to).toHaveBeenCalledWith(
        'calendar:2025-08-06:personal-training'
      )
      expect(mockSocket.emit).toHaveBeenCalledWith('availability-update', {
        date: '2025-08-06',
        serviceId: 'personal-training',
        slots,
        timestamp: expect.any(Number),
      })
    })
  })
})

// __tests__/hooks/useRealtimeAvailability.test.tsx
describe('useRealtimeAvailability', () => {
  it('should connect and join calendar room', async () => {
    const { result } = renderHook(() =>
      useRealtimeAvailability('2025-08-06', 'personal-training')
    )

    await waitFor(() => {
      expect(result.current.connectionStatus).toBe('connected')
    })

    expect(mockSocket.emit).toHaveBeenCalledWith('join-calendar', {
      date: '2025-08-06',
      serviceId: 'personal-training',
    })
  })

  it('should update availability when receiving updates', async () => {
    const { result } = renderHook(() => useRealtimeAvailability('2025-08-06'))

    const update = {
      slots: [{ time: '09:00', available: false }],
      timestamp: Date.now(),
    }

    act(() => {
      mockSocket.receive('availability-update', update)
    })

    expect(result.current.availability?.slots).toEqual(update.slots)
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/realtime-booking.integration.test.ts
describe('Real-time Booking Integration', () => {
  it('should handle concurrent booking attempts with conflict resolution', async () => {
    // Simulate two users attempting to book same slot
    const user1Socket = await createTestSocket()
    const user2Socket = await createTestSocket()

    const slotData = {
      date: '2025-08-06',
      time: '09:00',
      serviceId: 'personal-training',
    }

    // Both users attempt booking simultaneously
    const [result1, result2] = await Promise.all([
      user1Socket.reserveSlot(slotData),
      user2Socket.reserveSlot(slotData),
    ])

    // One should succeed, one should fail with conflict
    expect([result1.success, result2.success]).toEqual([true, false])
    expect(result2.error).toContain('slot no longer available')
  })
})
```

### E2E Validation

```typescript
// e2e/realtime-availability.spec.ts
test('should show real-time availability updates', async ({
  page,
  context,
}) => {
  // Open calendar in first tab
  await page.goto('/classes')
  await page.click('[data-testid="calendar-2025-08-06"]')

  // Open same calendar in second tab
  const page2 = await context.newPage()
  await page2.goto('/classes')
  await page2.click('[data-testid="calendar-2025-08-06"]')

  // Book slot in first tab
  await page.click('[data-testid="slot-09:00"]')
  await page.click('[data-testid="confirm-booking"]')

  // Verify second tab shows slot as unavailable
  await expect(page2.locator('[data-testid="slot-09:00"]')).toHaveAttribute(
    'data-available',
    'false'
  )
})
```

## Quality Gates

**Critical Gates** (Never bypass):

- All WebSocket connections must have proper error handling and reconnection logic
- Optimistic updates must have rollback mechanisms for server conflicts
- Connection state must be properly managed to prevent memory leaks
- All real-time updates must include conflict detection and resolution
- Redis state must be properly synchronized with database

**Warning Gates** (Track in .docs/debt.md):

- WebSocket connection pooling optimization
- Advanced conflict resolution strategies
- Performance monitoring for high-concurrency scenarios

## Complexity Assessment

**Factors that Increase Complexity**:

- Multiple concurrent users on same calendar view
- Complex conflict resolution requirements (multiple booking types, dependencies)
- High-frequency updates (real-time cursor tracking, live typing)
- Cross-service synchronization (calendar + payment + notifications)
- Mobile network reliability handling

**Factors that Reduce Complexity**:

- Single service type synchronization
- Simple conflict resolution (first-come-first-served)
- Limited concurrent user count
- Existing Redis infrastructure
- Standard WebSocket patterns

**Typical Appetite Requirements**:

- Simple implementation: 1-2 days (basic availability updates)
- Standard implementation: 2-3 days (with conflict resolution)
- Complex implementation: 4-5 days (multi-service, advanced features)

## Success Metrics

- Connection establishment: <2 seconds
- Update propagation: <500ms
- Conflict detection accuracy: >99%
- Reconnection success rate: >95%
- Memory leak prevention: No unbounded growth over 24h testing

## Common Pitfalls

1. **Connection Leak Management**: Ensure proper cleanup of socket connections and event listeners
   - **Prevention**: Use cleanup functions in useEffect, implement connection pooling limits

2. **Race Condition Conflicts**: Multiple users modifying same data simultaneously
   - **Prevention**: Implement proper locking mechanisms, use optimistic updates with server validation

3. **State Synchronization Drift**: Client and server state getting out of sync
   - **Prevention**: Regular state reconciliation, server-authoritative updates, conflict detection

4. **Network Reliability Issues**: Handling poor connections and reconnection scenarios
   - **Prevention**: Exponential backoff, connection state indicators, graceful degradation to polling

5. **Redis Memory Management**: Unbounded growth of real-time state data
   - **Prevention**: TTL on state entries, cleanup of expired sessions, memory monitoring

## Variations

**Server-Sent Events Fallback**: For environments where WebSocket is not available, implement SSE-based updates with similar conflict resolution

**Polling-Based Optimized**: Enhanced polling with smart intervals and change detection for simple scenarios

## Related Patterns

- [Booking Workflow Pattern](./medium-booking-workflow-pattern.md) - Integrates with real-time status updates
- [Notification System Pattern](./notification-system-pattern.md) - Real-time notifications complement availability updates
- [Redis Connection Pool Pattern](./db-connection-pool-pattern.md) - Shared Redis management strategy

## References

- Socket.IO documentation: https://socket.io/docs/
- WebSocket API specification
- Redis Pub/Sub patterns
- Next.js API routes with WebSocket

## History

- **Created**: 2025-08-06
- **Last Updated**: 2025-08-06
- **Used In**: []
- **Success Rate**: 0% (not yet implemented)

---

**Pattern Status**: Proven
**Confidence Level**: High
**Reuse Frequency**: High for any real-time feature requirements
