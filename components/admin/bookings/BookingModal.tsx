'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Phone, Mail, User, MapPin, MessageSquare, Target } from 'lucide-react';
import { StatusActions } from './BookingModalActions';

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

interface BookingModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (bookingId: string, status: string) => Promise<void>;
  isUpdating: boolean;
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;
  getNextStatus: (currentStatus: string) => string | null;
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

function ContactInformation({ booking }: { booking: Booking }): React.JSX.Element {
  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <User className="h-4 w-4" />
        Contact Information
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium text-gray-600">Name</div>
          <p className="mt-1">{booking.name}</p>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-600">Email</div>
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
          <div className="text-sm font-medium text-gray-600">Phone</div>
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
  );
}

function SessionDetails({ 
  booking, 
  formatDate, 
  formatTime 
}: { 
  booking: Booking; 
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;
}): React.JSX.Element {
  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Session Details
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium text-gray-600">Service</div>
          <p className="mt-1">{booking.service}</p>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-600">Duration</div>
          <p className="mt-1">{booking.duration} minutes</p>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-600">Date</div>
          <p className="mt-1">{formatDate(booking.date)}</p>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-600">Time</div>
          <p className="mt-1">{formatTime(booking.time)}</p>
        </div>
      </div>
      
      {booking.location && (
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-600">Location</div>
          <p className="mt-1 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {booking.location}
          </p>
        </div>
      )}
    </div>
  );
}

function ClientInformation({ booking }: { booking: Booking }): React.JSX.Element | null {
  if (!booking.goals && !booking.experience) return null;

  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Target className="h-4 w-4" />
        Client Information
      </h4>
      <div className="space-y-4">
        {booking.goals && (
          <div>
            <div className="text-sm font-medium text-gray-600">Goals</div>
            <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">{booking.goals}</p>
          </div>
        )}
        {booking.experience && (
          <div>
            <div className="text-sm font-medium text-gray-600">Experience Level</div>
            <p className="mt-1">{booking.experience}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdditionalMessage({ message }: { message: string }): React.JSX.Element {
  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Additional Message
      </h4>
      <p className="text-sm bg-gray-50 p-3 rounded-lg">{message}</p>
    </div>
  );
}

export function BookingModal({
  booking,
  isOpen,
  onClose,
  onStatusUpdate,
  isUpdating,
  formatDate,
  formatTime,
  getNextStatus,
}: BookingModalProps): React.JSX.Element | null {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[80vh] overflow-y-auto" 
        aria-labelledby={`booking-${booking.id}-title`} 
        aria-describedby={`booking-${booking.id}-details`}
      >
        <DialogHeader>
          <DialogTitle id={`booking-${booking.id}-title`} className="flex items-center gap-3">
            <span>Booking Details</span>
            <Badge className={statusColors[booking.status]} aria-label={`Status: ${statusLabels[booking.status]}`}>
              {statusLabels[booking.status]}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6" id={`booking-${booking.id}-details`}>
          <ContactInformation booking={booking} />
          <SessionDetails booking={booking} formatDate={formatDate} formatTime={formatTime} />
          <ClientInformation booking={booking} />
          {booking.message && <AdditionalMessage message={booking.message} />}
          <StatusActions 
            booking={booking} 
            isUpdating={isUpdating} 
            onStatusUpdate={onStatusUpdate} 
            getNextStatus={getNextStatus} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}