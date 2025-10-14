'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BookingModal } from '@/components/admin/bookings/BookingModal';
import { BookingFilters } from '@/components/admin/bookings/BookingFilters';
import { BookingList } from '@/components/admin/bookings/BookingList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Booking,
  getNextStatus,
  formatDate,
  formatTime,
  filterBookings,
} from '@/lib/admin/booking-utils';

function LoadingState(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Booking Management</h1>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }): React.JSX.Element {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Booking Management</h1>
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Error Loading Bookings</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <Button onClick={onRetry} variant="outline">Try Again</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


function useBookingFilters() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const clearFilters = (): void => {
    setStatusFilter('ALL');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  };

  return {
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clearFilters,
  };
}

function useBookingData(statusFilter: string, dateFrom: string, dateTo: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(`/api/admin/bookings?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.statusText}`);
      }

      const data = await response.json();
      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, fetchBookings };
}

function useBookingUpdate(fetchBookings: () => Promise<void>) {
  const [updatingBookings, setUpdatingBookings] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const updateBookingStatus = async (bookingId: string, newStatus: string): Promise<void> => {
    if (updatingBookings.has(bookingId)) return;

    try {
      setUpdatingBookings(prev => new Set(prev).add(bookingId));
      
      const response = await fetch(`/api/admin/bookings?id=${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update booking status');
      await fetchBookings();
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setUpdatingBookings(prev => {
        const next = new Set(prev);
        next.delete(bookingId);
        return next;
      });
    }
  };

  return { updatingBookings, updateBookingStatus, error };
}


function BookingPageHeader({
  filteredCount,
  totalCount
}: {
  filteredCount: number;
  totalCount: number;
}): React.JSX.Element {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Booking Management</h1>
      <div className="text-sm text-gray-600">
        {filteredCount} of {totalCount} bookings
      </div>
    </div>
  );
}

function useBookingModal() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (booking: Booking): void => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  return { selectedBooking, isModalOpen, openModal, closeModal };
}

interface BookingPageContentProps {
  filters: ReturnType<typeof useBookingFilters>;
  bookings: Booking[];
  filteredBookings: Booking[];
  openModal: (booking: Booking) => void;
  closeModal: () => void;
  selectedBooking: Booking | null;
  isModalOpen: boolean;
  updateBookingStatus: (bookingId: string, newStatus: string) => Promise<void>;
  updatingBookings: Set<string>;
}

function BookingPageContent({ filters, bookings, filteredBookings, openModal, closeModal, selectedBooking, isModalOpen, updateBookingStatus, updatingBookings }: BookingPageContentProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <BookingPageHeader filteredCount={filteredBookings.length} totalCount={bookings.length} />
      <BookingFilters statusFilter={filters.statusFilter} onStatusFilterChange={filters.setStatusFilter} searchQuery={filters.searchQuery} onSearchQueryChange={filters.setSearchQuery} dateFrom={filters.dateFrom} onDateFromChange={filters.setDateFrom} dateTo={filters.dateTo} onDateToChange={filters.setDateTo} onClearFilters={filters.clearFilters} showClearButton={filters.statusFilter !== 'ALL' || filters.searchQuery !== '' || filters.dateFrom !== '' || filters.dateTo !== ''} />
      <BookingList bookings={filteredBookings} onBookingClick={openModal} onStatusUpdate={updateBookingStatus} formatDate={formatDate} formatTime={formatTime} getNextStatus={getNextStatus} updatingBookings={updatingBookings} onClearFilters={filters.clearFilters} totalBookings={bookings.length} />
      <BookingModal booking={selectedBooking} isOpen={isModalOpen} onClose={closeModal} onStatusUpdate={updateBookingStatus} isUpdating={selectedBooking ? updatingBookings.has(selectedBooking.id) : false} formatDate={formatDate} formatTime={formatTime} getNextStatus={getNextStatus} />
    </div>
  );
}

export default function BookingsPage(): React.JSX.Element {
  const filters = useBookingFilters();
  const { bookings, loading, error, fetchBookings } = useBookingData(
    filters.statusFilter,
    filters.dateFrom,
    filters.dateTo
  );
  const { updatingBookings, updateBookingStatus, error: updateError } = useBookingUpdate(fetchBookings);
  const { selectedBooking, isModalOpen, openModal, closeModal } = useBookingModal();

  const filteredBookings = useMemo(
    () => filterBookings(bookings, {
      statusFilter: filters.statusFilter,
      searchQuery: filters.searchQuery,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    [bookings, filters.statusFilter, filters.searchQuery, filters.dateFrom, filters.dateTo]
  );

  const combinedError = error ?? updateError;

  if (loading) return <LoadingState />;
  if (combinedError) return <ErrorState error={combinedError} onRetry={fetchBookings} />;

  return (
    <BookingPageContent
      filters={filters}
      bookings={bookings}
      filteredBookings={filteredBookings}
      openModal={openModal}
      closeModal={closeModal}
      selectedBooking={selectedBooking}
      isModalOpen={isModalOpen}
      updateBookingStatus={updateBookingStatus}
      updatingBookings={updatingBookings}
    />
  );
}