# Real-Time Availability API

## Overview

The Real-Time Availability API provides transaction-safe availability checking to prevent booking conflicts. This API has been enhanced with function decomposition patterns, real-time conflict detection, and comprehensive error handling.

## Endpoints

### GET `/api/availability`

Returns available time slots for booking, with real-time conflict prevention.

#### Query Parameters

| Parameter | Type     | Required | Description                         |
| --------- | -------- | -------- | ----------------------------------- |
| `date`    | `string` | Yes      | Date in YYYY-MM-DD format           |
| `time`    | `string` | No       | Specific time slot to check (HH:MM) |

#### Response Format

**Full Day Availability** (when `time` parameter is omitted):

```json
{
  "availableTimes": ["09:00", "10:00", "11:00"],
  "bookedTimes": ["14:00", "15:00"],
  "date": "2024-12-25"
}
```

**Single Slot Check** (when `time` parameter is provided):

```json
{
  "isAvailable": true,
  "date": "2024-12-25",
  "time": "10:00"
}
```

**Conflict Response** (when slot is unavailable):

```json
{
  "isAvailable": false,
  "date": "2024-12-25",
  "time": "10:00",
  "conflictingBooking": {
    "id": "booking-123",
    "date": "2024-12-25",
    "time": "10:00"
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid parameters:

```json
{
  "message": "Invalid request parameters",
  "errors": {
    "date": ["Date must be in YYYY-MM-DD format"]
  }
}
```

**409 Conflict** - Availability conflict:

```json
{
  "message": "Invalid time slot: 99:00. This time slot is not available for booking.",
  "type": "availability_conflict"
}
```

**500 Server Error** - Internal server error:

```json
{
  "message": "Failed to fetch availability data",
  "type": "server_error"
}
```

## Real-Time Features

### Transaction Safety

- All database operations use transactions for ACID compliance
- Prevents race conditions during concurrent availability checks
- Ensures data consistency across booking operations

### Conflict Detection

- Real-time validation of time slot availability
- Integration with booking process to prevent double-bookings
- Immediate feedback on availability conflicts

### Caching Strategy

- **Full day availability**: 60 second cache with 30 second stale-while-revalidate
- **Single slot checks**: 30 second cache with 15 second stale-while-revalidate
- Shorter cache times ensure real-time accuracy for booking decisions

## Valid Time Slots

The API accepts time slots in 24-hour format (HH:MM):

```
06:00, 06:30, 07:00, 07:30, 08:00, 08:30, 09:00, 09:30,
10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30,
14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30
```

## Usage Examples

### Check Full Day Availability

```bash
GET /api/availability?date=2024-12-25
```

### Check Specific Time Slot

```bash
GET /api/availability?date=2024-12-25&time=10:00
```

### Frontend Integration

```javascript
// Check if a time slot is available before booking
const checkAvailability = async (date, time) => {
  const response = await fetch(`/api/availability?date=${date}&time=${time}`)
  const data = await response.json()

  if (!data.isAvailable) {
    throw new Error('Selected time slot is no longer available')
  }

  return data
}
```

## Architecture

### Function Decomposition

The API follows the Function Decomposition Pattern with separate modules for:

- **Validation**: `availability-validation.ts` - Request parameter validation
- **Checking**: `availability-checking.ts` - Core availability logic with transaction safety
- **Response**: `availability-response.ts` - Standardized response formatting

### Error Handling

Implements the Error Response Pattern for consistent error messaging and proper HTTP status codes.

### Integration Points

- **Booking Creation**: Real-time availability validation during booking process
- **Frontend Components**: `useAvailability` hook for React components
- **Transaction Safety**: Integration with existing booking transaction patterns

## Performance Considerations

- Database queries are optimized with targeted selects
- Transaction isolation prevents dirty reads
- Caching reduces database load for repeated requests
- Response times optimized for real-time user experience

## Security Features

- Input validation prevents injection attacks
- Parameter sanitization and type checking
- Rate limiting compatible (inherits from existing infrastructure)
- No sensitive data exposure in availability responses
