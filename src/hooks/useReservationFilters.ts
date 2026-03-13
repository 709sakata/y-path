import { useState, useMemo } from 'react';
import { Reservation } from '../types';
import { RESERVATION_STATUS } from '../constants';
import { parseISO, isBefore, isAfter, format } from 'date-fns';

export function useReservationFilters(reservations: Reservation[]) {
  const [activeFilter, setActiveFilter] = useState<'all' | typeof RESERVATION_STATUS[keyof typeof RESERVATION_STATUS]>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'date' | 'price'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('all');

  const programsList = useMemo(() => 
    Array.from(new Set(reservations.map(r => r.program_title))).filter(Boolean) as string[]
  , [reservations]);

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const matchesFilter = activeFilter === 'all' || res.status === activeFilter;
      const matchesSearch = 
        res.parent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.program_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProgram = selectedProgramFilter === 'all' || res.program_title === selectedProgramFilter;
      
      let matchesDate = true;
      if (dateRange.start && res.date) {
        const resDate = parseISO(res.date);
        const startDate = parseISO(dateRange.start);
        matchesDate = matchesDate && (isAfter(resDate, startDate) || format(resDate, 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd'));
      }
      if (dateRange.end && res.date) {
        const resDate = parseISO(res.date);
        const endDate = parseISO(dateRange.end);
        matchesDate = matchesDate && (isBefore(resDate, endDate) || format(resDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd'));
      }

      return matchesFilter && matchesSearch && matchesProgram && matchesDate;
    }).sort((a, b) => {
      let valA: any, valB: any;
      if (sortBy === 'created_at') {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else if (sortBy === 'date') {
        valA = new Date(a.date || 0).getTime();
        valB = new Date(b.date || 0).getTime();
      } else {
        valA = a.total_price;
        valB = b.total_price;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [reservations, activeFilter, searchQuery, selectedProgramFilter, dateRange, sortBy, sortOrder]);

  return {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    dateRange,
    setDateRange,
    selectedProgramFilter,
    setSelectedProgramFilter,
    programsList,
    filteredReservations
  };
}
