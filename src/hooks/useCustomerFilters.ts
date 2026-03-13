import { useState, useMemo } from 'react';
import { Parent } from '../types';
import { MEMBERSHIP_TYPE } from '../constants';

export type CustomerFilterType = 'all' | typeof MEMBERSHIP_TYPE.MEMBER | typeof MEMBERSHIP_TYPE.GENERAL;

export function useCustomerFilters(customers: Parent[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<CustomerFilterType>('all');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery);
      
      const matchesType = filterType === 'all' || c.parent_organizations?.[0]?.membership_type === filterType;
      
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
