'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface Booking {
  id: string;
  name: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

const statusLabels = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

function NextStatusButton({ 
  bookingId, 
  nextStatus, 
  isUpdating, 
  onStatusUpdate 
}: { 
  bookingId: string;
  nextStatus: string;
  isUpdating: boolean;
  onStatusUpdate: (bookingId: string, status: string) => Promise<void>;
}): React.JSX.Element {
  return (
    <Button
      onClick={() => void onStatusUpdate(bookingId, nextStatus)}
      size="sm"
      disabled={isUpdating}
      data-testid={`modal-booking-${bookingId}-mark-as-${nextStatus.toLowerCase()}`}
    >
      Mark as {statusLabels[nextStatus as keyof typeof statusLabels]}
    </Button>
  );
}

function CancelButton({ 
  bookingId, 
  isUpdating, 
  onStatusUpdate 
}: { 
  bookingId: string;
  isUpdating: boolean;
  onStatusUpdate: (bookingId: string, status: string) => Promise<void>;
}): React.JSX.Element {
  return (
    <Button
      onClick={() => void onStatusUpdate(bookingId, 'CANCELLED')}
      variant="outline"
      size="sm"
      disabled={isUpdating}
      className="text-red-600 border-red-200 hover:bg-red-50"
      data-testid={`modal-booking-${bookingId}-cancel`}
    >
      Cancel Booking
    </Button>
  );
}

function RestoreButton({ 
  bookingId, 
  onStatusUpdate 
}: { 
  bookingId: string;
  onStatusUpdate: (bookingId: string, status: string) => Promise<void>;
}): React.JSX.Element {
  return (
    <Button
      onClick={() => void onStatusUpdate(bookingId, 'PENDING')}
      variant="outline"
      size="sm"
      className="text-green-600 border-green-200 hover:bg-green-50"
    >
      Restore to Pending
    </Button>
  );
}

export function StatusActions({ 
  booking, 
  isUpdating, 
  onStatusUpdate, 
  getNextStatus 
}: { 
  booking: Booking;
  isUpdating: boolean;
  onStatusUpdate: (bookingId: string, status: string) => Promise<void>;
  getNextStatus: (currentStatus: string) => string | null;
}): React.JSX.Element {
  const nextStatus = getNextStatus(booking.status);
  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const canRestore = booking.status === 'CANCELLED';

  return (
    <div className="border-t pt-4">
      <h4 className="font-semibold mb-3">Status Actions</h4>
      <div className="flex flex-wrap gap-2">
        {nextStatus && (
          <NextStatusButton 
            bookingId={booking.id}
            nextStatus={nextStatus}
            isUpdating={isUpdating}
            onStatusUpdate={onStatusUpdate}
          />
        )}
        {canCancel && (
          <CancelButton 
            bookingId={booking.id}
            isUpdating={isUpdating}
            onStatusUpdate={onStatusUpdate}
          />
        )}
        {canRestore && (
          <RestoreButton bookingId={booking.id} onStatusUpdate={onStatusUpdate} />
        )}
      </div>
    </div>
  );
}