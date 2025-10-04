'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Phone, Mail, User, MapPin, MessageSquare, Target, Trophy } from 'lucide-react';

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

export default function BookingsPage(): React.JSX.Element {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchBookings = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
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
  }, [statusFilter, searchQuery, dateFrom, dateTo]);

  const applyFilters = useCallback((): void => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.name.toLowerCase().includes(query) ||
        booking.email.toLowerCase().includes(query) ||
        booking.service.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(booking => booking.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(booking => booking.date <= dateTo);
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, searchQuery, dateFrom, dateTo]);

  // Load bookings
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const updateBookingStatus = async (bookingId: string, newStatus: string): Promise<void> => {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      // Refresh bookings
      await fetchBookings();
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    switch (currentStatus) {
      case 'PENDING':
        return 'CONFIRMED';
      case 'CONFIRMED':
        return 'COMPLETED';
      default:
        return null;
    }
  };

  const clearFilters = (): void => {
    setStatusFilter('ALL');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string): string => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Booking Management</h1>
        </div>
        
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Booking Management</h1>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">Error Loading Bookings</div>
              <div className="text-gray-600 mb-4">{error}</div>
              <Button onClick={() => fetchBookings()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Booking Management</h1>
        <div className="text-sm text-gray-600">
          {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold tracking-tight text-lg">Filters</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING" data-testid="status-filter-pending">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="search-input" className="block text-sm font-medium mb-1">Search</label>
              <Input
                id="search-input"
                placeholder="Search by name, email, or service"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="date-from" className="block text-sm font-medium mb-1">From Date</label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="date-to" className="block text-sm font-medium mb-1">To Date</label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          
          {(statusFilter !== 'ALL' || searchQuery || dateFrom || dateTo) && (
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear All Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h2 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h2>
                <p className="text-gray-600">
                  {bookings.length === 0 
                    ? "No bookings have been created yet." 
                    : "No bookings match your current filters."}
                </p>
                {(statusFilter !== 'ALL' || searchQuery || dateFrom || dateTo) && (
                  <Button onClick={clearFilters} variant="outline" className="mt-4">
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
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
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Quick Actions */}
                    {getNextStatus(booking.status) && (
                      <Button
                        onClick={() => {
                          const nextStatus = getNextStatus(booking.status);
                          if (nextStatus) {
                            updateBookingStatus(booking.id, nextStatus);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        data-testid={`booking-${booking.id}-mark-as-${getNextStatus(booking.status)?.toLowerCase()}`}
                        aria-label={`Mark ${booking.name}'s booking as ${statusLabels[getNextStatus(booking.status) as keyof typeof statusLabels]}`}
                      >
                        Mark as {statusLabels[getNextStatus(booking.status) as keyof typeof statusLabels]}
                      </Button>
                    )}
                    
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <Button
                        onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        data-testid={`booking-${booking.id}-cancel`}
                        aria-label={`Cancel ${booking.name}'s booking`}
                      >
                        Cancel
                      </Button>
                    )}
                    
                    {/* Detail Modal */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" aria-describedby={`booking-${booking.id}-details`}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-labelledby={`booking-${booking.id}-title`} aria-describedby={`booking-${booking.id}-details`}>
                        <DialogHeader>
                          <DialogTitle id={`booking-${booking.id}-title`} className="flex items-center gap-3">
                            <span>Booking Details - {booking.name}</span>
                            <Badge className={statusColors[booking.status]} aria-label={`Status: ${statusLabels[booking.status]}`}>
                              {statusLabels[booking.status]}
                            </Badge>
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Contact Information */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Contact Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-600">Name</label>
                                <p className="mt-1">{booking.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Email</label>
                                <p className="mt-1">
                                  <a 
                                    href={`mailto:${booking.email}`}
                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <Mail className="h-4 w-4" />
                                    {booking.email}
                                  </a>
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Phone</label>
                                <p className="mt-1">
                                  <a 
                                    href={`tel:${booking.phone}`}
                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <Phone className="h-4 w-4" />
                                    {booking.phone}
                                  </a>
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Session Details */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Session Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-600">Service</label>
                                <p className="mt-1">{booking.service}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Duration</label>
                                <p className="mt-1">{booking.duration} minutes</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Date</label>
                                <p className="mt-1">{formatDate(booking.date)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Time</label>
                                <p className="mt-1">{formatTime(booking.time)}</p>
                              </div>
                            </div>
                            
                            {booking.location && (
                              <div className="mt-4">
                                <label className="text-sm font-medium text-gray-600">Location</label>
                                <p className="mt-1 flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {booking.location}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Client Information */}
                          {(booking.goals ?? booking.experience) && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Client Information
                              </h4>
                              <div className="space-y-4">
                                {booking.goals && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Goals</label>
                                    <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">{booking.goals}</p>
                                  </div>
                                )}
                                {booking.experience && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Experience Level</label>
                                    <p className="mt-1">{booking.experience}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Messages */}
                          {booking.message && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Additional Message
                              </h4>
                              <p className="text-sm bg-gray-50 p-3 rounded-lg">{booking.message}</p>
                            </div>
                          )}
                          
                          {/* Status Update Actions */}
                          <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3">Status Actions</h4>
                            <div className="flex flex-wrap gap-2">
                              {getNextStatus(booking.status) && (
                                <Button
                                  onClick={() => {
                                    const nextStatus = getNextStatus(booking.status);
                                    if (nextStatus) {
                                      updateBookingStatus(booking.id, nextStatus);
                                    }
                                  }}
                                  size="sm"
                                >
                                  Mark as {statusLabels[getNextStatus(booking.status) as keyof typeof statusLabels]}
                                </Button>
                              )}
                              
                              {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                <Button
                                  onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  Cancel Booking
                                </Button>
                              )}
                              
                              {booking.status === 'CANCELLED' && (
                                <Button
                                  onClick={() => updateBookingStatus(booking.id, 'PENDING')}
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  Restore to Pending
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}