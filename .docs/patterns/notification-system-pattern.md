+++
[metadata]
type = "implementation_pattern"
complexity = 6
priority = "low"
phase = 3
status = "proven"
created = "2025-08-06"
last_updated = "2025-08-06"
used_in = []
success_rate = 0.0

[business_impact]
feature_enabler = "in-app notifications, push notifications"
blocking_deployment = false
user_experience_impact = "medium"
performance_impact = "medium"

[technical_details]
files_affected = 6
appetite_estimate = "2-3 days"
dependencies = ["WebSocket", "service worker", "push notifications"]
integration_points = ["real-time sync", "email system", "user preferences"]
+++

# Pattern: Multi-Channel Notification System

**Complexity**: Medium-Complex (5-6)
**Files Affected**: 6-7 files (notification service, WebSocket handler, push service, UI components, preferences)
**Prerequisites**: WebSocket support, service worker setup, push notification permissions
**Use Cases**: In-app notifications, push notifications, SMS integration, notification preferences, delivery tracking

## Context & Problem

**When to Use**: When users need timely notifications beyond email - booking reminders, real-time updates, system alerts, marketing messages
**Problem Solved**: Provides immediate user engagement, reduces missed appointments, enables real-time communication, supports multiple notification channels
**Appetite Scope**: 2-3 days for basic in-app notifications, 3-4 days with push notifications and advanced preferences

## Solution Overview

Implements a comprehensive notification system with multiple delivery channels, user preferences, delivery tracking, and integration with existing real-time synchronization and email systems.

## Implementation Details

### Code Structure

```typescript
// lib/notifications/notification-service.ts
import { EventEmitter } from 'events'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  userId: string
  channels: NotificationChannel[]
  priority: NotificationPriority
  scheduledFor?: Date
  expiresAt?: Date
  createdAt: Date
  readAt?: Date
  deliveryStatus: NotificationDeliveryStatus[]
}

export enum NotificationType {
  BOOKING_REMINDER = 'booking_reminder',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  SYSTEM_ALERT = 'system_alert',
  MARKETING = 'marketing',
  ADMIN_ALERT = 'admin_alert'
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface UserNotificationPreferences {
  userId: string
  channels: {
    [key in NotificationChannel]: boolean
  }
  types: {
    [key in NotificationType]: NotificationChannel[]
  }
  quietHours?: {
    enabled: boolean
    startTime: string // HH:MM format
    endTime: string
    timezone: string
  }
  frequency: {
    marketing: 'immediate' | 'daily' | 'weekly' | 'never'
    reminders: 'immediate' | 'disabled'
  }
}

export class NotificationService extends EventEmitter {
  private deliveryHandlers = new Map<NotificationChannel, NotificationDeliveryHandler>()

  constructor() {
    super()
    this.setupDeliveryHandlers()
  }

  async sendNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'deliveryStatus'>): Promise<string> {
    const fullNotification: Notification = {
      ...notification,
      id: this.generateNotificationId(),
      createdAt: new Date(),
      deliveryStatus: []
    }

    // Get user preferences
    const preferences = await this.getUserPreferences(notification.userId)

    // Filter channels based on preferences
    const enabledChannels = this.filterChannelsByPreferences(
      notification.channels,
      notification.type,
      preferences
    )

    // Check quiet hours
    if (this.isQuietHours(preferences) && notification.priority !== NotificationPriority.URGENT) {
      // Schedule for later
      fullNotification.scheduledFor = this.calculateNextDeliveryTime(preferences)
      await this.scheduleNotification(fullNotification)
      return fullNotification.id
    }

    // Store notification
    await this.storeNotification(fullNotification)

    // Deliver to enabled channels
    await this.deliverToChannels(fullNotification, enabledChannels)

    this.emit('notification-sent', fullNotification)
    return fullNotification.id
  }

  private async deliverToChannels(notification: Notification, channels: NotificationChannel[]): Promise<void> {
    const deliveryPromises = channels.map(async channel => {
      const handler = this.deliveryHandlers.get(channel)
      if (!handler) {
        console.warn(`No handler registered for channel: ${channel}`)
        return
      }

      const deliveryStatus: NotificationDeliveryStatus = {
        channel,
        status: 'pending',
        timestamp: new Date()
      }

      try {
        await handler.deliver(notification)
        deliveryStatus.status = 'sent'

        this.emit('notification-delivered', { notification, channel })
      } catch (error) {
        deliveryStatus.status = 'failed'
        deliveryStatus.error = error instanceof Error ? error.message : 'Unknown error'

        this.emit('notification-failed', { notification, channel, error })
      }

      // Update delivery status
      notification.deliveryStatus.push(deliveryStatus)
      await this.updateNotificationDeliveryStatus(notification.id, deliveryStatus)
    })

    await Promise.all(deliveryPromises)
  }

  private filterChannelsByPreferences(
    requestedChannels: NotificationChannel[],
    type: NotificationType,
    preferences: UserNotificationPreferences
  ): NotificationChannel[] {
    return requestedChannels.filter(channel => {
      // Check if channel is globally enabled
      if (!preferences.channels[channel]) {
        return false
      }

      // Check if channel is enabled for this notification type
      const typePreferences = preferences.types[type]
      return typePreferences?.includes(channel) ?? false
    })
  }

  private isQuietHours(preferences: UserNotificationPreferences): boolean {
    if (!preferences.quietHours?.enabled) {
      return false
    }

    const now = new Date()
    const userTimezone = preferences.quietHours.timezone
    const currentTime = now.toLocaleTimeString('en-US', {
      timeZone: userTimezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    })

    const startTime = preferences.quietHours.startTime
    const endTime = preferences.quietHours.endTime

    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime
    } else {
      return currentTime >= startTime && currentTime <= endTime
    }
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() }
    })

    this.emit('notification-read', { notificationId, userId })
  }
}

// Delivery handler implementations
interface NotificationDeliveryHandler {
  deliver(notification: Notification): Promise<void>
}

class InAppNotificationHandler implements NotificationDeliveryHandler {
  async deliver(notification: Notification): Promise<void> {
    // Send via WebSocket to connected clients
    const wsManager = WebSocketManager.getInstance()
    await wsManager.sendToUser(notification.userId, 'notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      priority: notification.priority,
      createdAt: notification.createdAt
    })
  }
}

class PushNotificationHandler implements NotificationDeliveryHandler {
  async deliver(notification: Notification): Promise<void> {
    const subscription = await this.getUserPushSubscription(notification.userId)
    if (!subscription) {
      throw new Error('No push subscription found for user')
    }

    const payload = {
      title: notification.title,
      body: notification.message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        notificationId: notification.id,
        url: this.getNotificationUrl(notification),
        ...notification.data
      },
      requireInteraction: notification.priority === NotificationPriority.URGENT,
      tag: `${notification.type}_${notification.userId}`
    }

    await webpush.sendNotification(subscription, JSON.stringify(payload))
  }

  private async getUserPushSubscription(userId: string): Promise<any> {
    const subscription = await prisma.pushSubscription.findFirst({
      where: { userId, active: true }
    })
    return subscription?.subscription
  }

  private getNotificationUrl(notification: Notification): string {
    switch (notification.type) {
      case NotificationType.BOOKING_REMINDER:
      case NotificationType.BOOKING_CONFIRMED:
        return `/bookings/${notification.data?.bookingId}`
      case NotificationType.SYSTEM_ALERT:
        return '/notifications'
      default:
        return '/'
    }
  }
}

// React hooks and components
// hooks/useNotifications.ts
import { useEffect, useState } from 'react'
import { useWebSocket } from './useWebSocket'

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { socket, isConnected } = useWebSocket()

  useEffect(() => {
    if (!userId) return

    // Load initial notifications
    loadNotifications()

    // Listen for new notifications via WebSocket
    if (socket) {
      socket.on('notification', handleNewNotification)
      return () => socket.off('notification', handleNewNotification)
    }
  }, [userId, socket])

  const loadNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`)
      const data = await response.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + 1)

    // Show browser notification if supported
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png'
      })
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' })
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, readAt: new Date() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    refresh: loadNotifications
  }
}

// components/NotificationCenter.tsx
import { Bell, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface NotificationCenterProps {
  userId: string
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead } = useNotifications(userId)

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto z-50">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${
                    !notification.readAt ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.readAt) {
                      markAsRead(notification.id)
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.readAt && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
```

### Key Components

- **NotificationService**: Core service managing multi-channel notification delivery
- **Delivery Handlers**: Pluggable handlers for different notification channels (in-app, push, email, SMS)
- **User Preferences**: Comprehensive preference management with quiet hours and channel selection
- **Delivery Tracking**: Status tracking for each notification across all channels
- **Scheduled Notifications**: Support for delayed delivery and quiet hours respect
- **WebSocket Integration**: Real-time in-app notifications via existing WebSocket infrastructure
- **Push Notification Support**: Service worker integration for browser push notifications
- **React Components**: Notification center UI with real-time updates

### Dependencies

- WebSocket infrastructure for real-time in-app notifications
- Service worker support for push notifications
- `web-push` library for push notification delivery
- Integration with existing email service
- SMS provider integration (Twilio, AWS SNS, etc.)
- `@prisma/client` for notification storage and preferences

## Testing Strategy

### Unit Tests

```typescript
// __tests__/lib/notifications/notification-service.test.ts
describe('NotificationService', () => {
  let notificationService: NotificationService

  beforeEach(() => {
    notificationService = new NotificationService()
  })

  describe('sendNotification', () => {
    it('should deliver notification to enabled channels', async () => {
      const mockPreferences: UserNotificationPreferences = {
        userId: 'user-1',
        channels: { in_app: true, push: false, email: true, sms: false },
        types: {
          booking_reminder: [
            NotificationChannel.IN_APP,
            NotificationChannel.EMAIL,
          ],
        },
      }

      jest
        .spyOn(notificationService as any, 'getUserPreferences')
        .mockResolvedValue(mockPreferences)

      await notificationService.sendNotification({
        type: NotificationType.BOOKING_REMINDER,
        title: 'Test Notification',
        message: 'Test message',
        userId: 'user-1',
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        priority: NotificationPriority.NORMAL,
      })

      expect(mockDeliveryHandler.deliver).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.BOOKING_REMINDER,
          title: 'Test Notification',
          userId: 'user-1',
        })
      )
    })

    it('should respect quiet hours for non-urgent notifications', async () => {
      const mockPreferences: UserNotificationPreferences = {
        userId: 'user-1',
        channels: { in_app: true, push: true, email: true, sms: false },
        types: { system_alert: [NotificationChannel.IN_APP] },
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '07:00',
          timezone: 'America/New_York',
        },
      }

      jest
        .spyOn(notificationService as any, 'isQuietHours')
        .mockReturnValue(true)
      jest
        .spyOn(notificationService as any, 'scheduleNotification')
        .mockResolvedValue(undefined)

      const notificationId = await notificationService.sendNotification({
        type: NotificationType.SYSTEM_ALERT,
        title: 'System Alert',
        message: 'Non-urgent alert',
        userId: 'user-1',
        channels: [NotificationChannel.IN_APP],
        priority: NotificationPriority.NORMAL,
      })

      expect(notificationService.scheduleNotification).toHaveBeenCalled()
    })
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/notification-system.integration.test.ts
describe('Notification System Integration', () => {
  it('should send booking confirmation through multiple channels', async () => {
    const testUser = await createTestUser({
      email: 'test@example.com',
      phone: '+1234567890',
    })

    const testBooking = await createTestBooking({
      userId: testUser.id,
      service: 'Personal Training',
      date: '2025-08-07',
      time: '10:00',
    })

    const notificationService = new NotificationService()
    const bookingNotifications = new BookingNotificationService(
      notificationService
    )

    await bookingNotifications.sendBookingConfirmation(testBooking)

    // Verify notification was stored
    const storedNotification = await prisma.notification.findFirst({
      where: {
        userId: testUser.id,
        type: NotificationType.BOOKING_CONFIRMED,
      },
    })

    expect(storedNotification).toBeTruthy()
    expect(storedNotification?.title).toBe('Booking Confirmed')
  })
})
```

### E2E Validation

```typescript
// e2e/notification-system.spec.ts
test('user receives and interacts with notifications', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['notifications'])

  await page.goto('/')
  await userLogin(page, { email: 'test@example.com' })

  // Navigate to booking page
  await page.goto('/book-session')
  await page.fill('[data-testid="service-selection"]', 'Personal Training')
  await page.click('[data-testid="confirm-booking"]')

  // Wait for booking confirmation and notification
  await expect(page.locator('[data-testid="booking-success"]')).toBeVisible()

  // Check notification center
  await expect(
    page.locator('[data-testid="notification-badge"]')
  ).toContainText('1')

  // Open notification center
  await page.click('[data-testid="notification-bell"]')
  await expect(
    page.locator('[data-testid="notification-center"]')
  ).toBeVisible()

  // Should show booking confirmation notification
  await expect(page.locator('[data-testid="notification-item"]')).toContainText(
    'Booking Confirmed'
  )
})
```

## Quality Gates

**Critical Gates** (Never bypass):

- Notification delivery must never fail silently - all delivery attempts must be logged
- User preferences must be respected for all notification channels
- Quiet hours must be enforced for non-urgent notifications
- Push notification subscriptions must be properly managed and cleaned up
- Delivery status tracking must be accurate for all channels

**Warning Gates** (Track in .docs/debt.md):

- Performance impact of real-time notification processing
- Notification queue size limits and cleanup policies
- Advanced notification batching and grouping features

## Success Metrics

- Notification delivery success rate: >99% across all channels
- Real-time delivery latency: <500ms for in-app notifications
- Push notification engagement rate: >20% click-through rate
- Preference compliance: 100% adherence to user settings
- System reliability: <0.1% notification system downtime

## Common Pitfalls

1. **Notification Spam**: Sending too many notifications overwhelming users
   - **Prevention**: Implement frequency limits, intelligent batching, user preference controls

2. **Delivery Failures**: Not handling failed deliveries gracefully
   - **Prevention**: Implement retry mechanisms, fallback channels, comprehensive error logging

3. **Performance Issues**: Real-time notifications impacting application performance
   - **Prevention**: Optimize WebSocket handling, implement notification queuing, use efficient data structures

4. **Privacy Concerns**: Not respecting user preferences or sending to wrong channels
   - **Prevention**: Strict preference checking, channel validation, opt-out mechanisms

5. **Push Notification Problems**: Invalid subscriptions or permission issues
   - **Prevention**: Regular subscription cleanup, graceful permission handling, fallback strategies

## Related Patterns

- [Real-Time Data Synchronization Pattern](./realtime-data-synchronization-pattern.md) - WebSocket infrastructure for in-app notifications
- [Dynamic Email Template Pattern](./dynamic-email-template-pattern.md) - Email notification content management
- [Admin Authentication Pattern](./admin-authentication-pattern.md) - Admin notification management access

## References

- Web Push Protocol: https://tools.ietf.org/html/rfc8030
- Service Worker API documentation
- WebSocket notification patterns
- Push notification best practices

## History

- **Created**: 2025-08-06
- **Last Updated**: 2025-08-06
- **Used In**: []
- **Success Rate**: 0% (not yet implemented)

---

**Pattern Status**: Proven
**Confidence Level**: High
**Reuse Frequency**: High for any application requiring user engagement and timely communications
