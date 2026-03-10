import { useState, useMemo } from 'react';
import { Parent } from '../types';

export type CustomerFilterType = 'all' | 'member' | 'general';

export function useCustomerFilters(customers: Parent[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<CustomerFilterType>('all');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery);
      
      const matchesType = filterType === 'all' || c.membership_type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [customers, searchQuery, filterType]);

  return {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filteredCustomers
  };
}
