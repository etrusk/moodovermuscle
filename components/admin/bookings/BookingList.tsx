'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Trophy } from 'lucide-react';

interface Booking {
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

interface BookingListProps {
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
  onStatusUpdate: (bookingId: string, status: string) => Promise<void>;
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;
  getNextStatus: (currentStatus: string) => string | null;
  updatingBookings: Set<string>;
  onClearFilters: () => void;
  totalBookings: number;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
};

const statusLabels = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

function EmptyState({ 
  totalBookings, 
  onClearFilters 
}: { 
  totalBookings: number; 
  onClearFilters: () => void; 
}): React.JSX.Element {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h2>
          <p className="text-gray-600">
            {totalBookings === 0 
              ? "No bookings have been created yet." 
              : "No bookings match your current filters."}
          </p>
          {totalBookings > 0 && (
            <Button onClick={onClearFilters} variant="outline" className="mt-4">
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BookingCardHeader({ booking }: { booking: Booking }): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-lg font-semibold">{booking.name}</h2>
      <Badge
        className={statusColors[booking.status]}
        data-testid={`booking-${booking.id}-status`}
        aria-label={`Booking status: ${statusLabels[booking.status]}`}
      >
        {statusLabels[booking.status]}
      </Badge>
    </div>
  );
}

function BookingCardDetails({ 
  booking, 
  formatDate, 
  formatTime 
}: { 
  booking: Booking; 
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        <span>{formatDate(booking.date)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        <span>{formatTime(booking.time)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Trophy className="h-4 w-4" />
        <span>{booking.service}</span>
      </div>
    </div>
  );
}

function NextStatusActionButton({
  booking,
  nextStatus,
  isUpdating,
  onStatusUpdate
}: {
  booking: Booking;
  nextStatus: string;
  isUpdating: boolean;
  onStatusUpdate: (bookingId: string, status: string) => Promise<void>;
}): React.JSX.Element {
  return (
    <Button
      onClick={() => void onStatusUpdate(booking.id, nextStatus)}
      variant="outline"
      size="sm"
      disabled={isUpdating}
      data-testid={`booking-${booking.id}-mark-as-${nextStatus.toLowerCase()}`}
      aria-label={`Mark ${booking.name}'s booking as ${statusLabels[nextStatus as keyof typeof statusLabels]}`}
    >
      Mark as {statusLabels[nextStatus as keyof typeof statusLabels]}
    </Button>
  );
}

function CancelActionButton({
  booking,
  isUpdating,
  onStatusUpdate
}: {
  booking: Booking;
  isUpdating: boolean;
  onStatusUpdate: (bookingId: string, status: string) => Promise<void>;
}): React.JSX.Element {
  return (
    <Button
      onClick={() => void onStatusUpdate(booking.id, 'CANCELLED')}
      variant="outline"
      size="sm"
      disabled={isUpdating}
      className="text-red-600 border-red-200 hover:bg-red-50"
      data-testid={`booking-${booking.id}-cancel`}
      aria-label={`Cancel ${booking.name}'s booking`}
    >
      Cancel
    </Button>
  );
}

function BookingCardActions({
  booking,
  onStatusUpdate,
  onBookingClick,
  getNextStatus,
  updatingBookings
}: {
  booking: Booking;
  onStatusUpdate: (bookingId: string, status: string) => Promise<void>;
  onBookingClick: (booking: Booking) => void;
  getNextStatus: (currentStatus: string) => string | null;
  updatingBookings: Set<string>;
}): React.JSX.Element {
  const nextStatus = getNextStatus(booking.status);
  const isUpdating = updatingBookings.has(booking.id);
  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';

  return (
    <div className="flex items-center gap-2">
      {nextStatus && (
        <NextStatusActionButton
          booking={booking}
          nextStatus={nextStatus}
          isUpdating={isUpdating}
          onStatusUpdate={onStatusUpdate}
        />
      )}
      
      {canCancel && (
        <CancelActionButton
          booking={booking}
          isUpdating={isUpdating}
          onStatusUpdate={onStatusUpdate}
        />
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onBookingClick(booking)}
        aria-describedby={`booking-${booking.id}-details`}
      >
        View Details
      </Button>
    </div>
  );
}

function BookingCard(props: {
  booking: Booking;
  onBookingClick: (booking: Booking) => void;
  onStatusUpdate: (bookingId: string, status: string) => Promise<void>;
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;
  getNextStatus: (currentStatus: string) => string | null;
  updatingBookings: Set<string>;
}): React.JSX.Element {
  const { booking, formatDate, formatTime, onStatusUpdate, onBookingClick, getNextStatus, updatingBookings } = props;

  return (
    <Card key={booking.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <BookingCardHeader booking={booking} />
            <BookingCardDetails booking={booking} formatDate={formatDate} formatTime={formatTime} />
          </div>
          <BookingCardActions 
            booking={booking}
            onStatusUpdate={onStatusUpdate}
            onBookingClick={onBookingClick}
            getNextStatus={getNextStatus}
            updatingBookings={updatingBookings}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function BookingList(props: BookingListProps): React.JSX.Element {
  const { bookings, totalBookings, onClearFilters } = props;

  if (bookings.length === 0) {
    return <EmptyState totalBookings={totalBookings} onClearFilters={onClearFilters} />;
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} {...props} booking={booking} />
      ))}
    </div>
  );
}