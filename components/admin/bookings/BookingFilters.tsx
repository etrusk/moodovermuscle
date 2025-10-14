'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BookingFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  dateFrom: string;
  onDateFromChange: (date: string) => void;
  dateTo: string;
  onDateToChange: (date: string) => void;
  onClearFilters: () => void;
  showClearButton: boolean;
}

function StatusFilterField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}): React.JSX.Element {
  return (
    <div>
      <label htmlFor="status-filter" className="block text-sm font-medium mb-1">
        Status
      </label>
      <Select value={value} onValueChange={onChange}>
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
  );
}

function SearchFilterField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}): React.JSX.Element {
  return (
    <div>
      <label htmlFor="search-input" className="block text-sm font-medium mb-1">
        Search
      </label>
      <Input
        id="search-input"
        placeholder="Search by name, email, or service"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function DateRangeFields({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
}): React.JSX.Element {
  return (
    <>
      <div>
        <label htmlFor="date-from" className="block text-sm font-medium mb-1">
          From Date
        </label>
        <Input
          id="date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="date-to" className="block text-sm font-medium mb-1">
          To Date
        </label>
        <Input
          id="date-to"
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
        />
      </div>
    </>
  );
}

export function BookingFilters(props: BookingFiltersProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold tracking-tight text-lg">Filters</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatusFilterField value={props.statusFilter} onChange={props.onStatusFilterChange} />
          <SearchFilterField value={props.searchQuery} onChange={props.onSearchQueryChange} />
          <DateRangeFields
            dateFrom={props.dateFrom}
            dateTo={props.dateTo}
            onDateFromChange={props.onDateFromChange}
            onDateToChange={props.onDateToChange}
          />
        </div>
        
        {props.showClearButton && (
          <Button onClick={props.onClearFilters} variant="outline" size="sm">
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}