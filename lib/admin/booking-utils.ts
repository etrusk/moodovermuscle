export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  goals?: string;
  experience?: string;
  message?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  statusFilter: string;
  searchQuery: string;
  dateFrom: string;
  dateTo: string;
}

export function getNextStatus(currentStatus: string): string | null {
  switch (currentStatus) {
    case 'PENDING':
      return 'CONFIRMED';
    case 'CONFIRMED':
      return 'COMPLETED';
    default:
      return null;
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-AU', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(timeString: string): string {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function matchesStatusFilter(booking: Booking, statusFilter: string): boolean {
  return statusFilter === 'ALL' || booking.status === statusFilter;
}

function matchesSearchQuery(booking: Booking, searchQuery: string): boolean {
  if (!searchQuery) return true;
  
  const query = searchQuery.toLowerCase();
  return (
    booking.name.toLowerCase().includes(query) ||
    booking.email.toLowerCase().includes(query) ||
    booking.service.toLowerCase().includes(query)
  );
}

function matchesDateRange(booking: Booking, dateFrom: string, dateTo: string): boolean {
  if (dateFrom && booking.date < dateFrom) return false;
  if (dateTo && booking.date > dateTo) return false;
  return true;
}

export function filterBookings(bookings: Booking[], filters: FilterOptions): Booking[] {
  return bookings.filter(booking =>
    matchesStatusFilter(booking, filters.statusFilter) &&
    matchesSearchQuery(booking, filters.searchQuery) &&
    matchesDateRange(booking, filters.dateFrom, filters.dateTo)
  );
}