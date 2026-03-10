import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Parent } from '../types';
import { api as appApi } from '../services/api';
import { useCustomerFilters } from '../hooks/useCustomerFilters';
import { CustomerList } from './CustomerList';
import { CustomerDetail } from './CustomerDetail';
import { CustomerEdit } from './CustomerEdit';

interface CustomersManagerProps {
  customers: Parent[];
  onRefresh: () => void;
}

export function CustomersManager({ customers, onRefresh }: CustomersManagerProps) {
  const { 
    searchQuery, 
    setSearchQuery, 
    filterType, 
    setFilterType, 
    filteredCustomers 
  } = useCustomerFilters(customers);

  const [selectedCustomer, setSelectedCustomer] = useState<Parent | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSelectCustomer = async (customer: Parent) => {
    setSelectedCustomer(customer);
    setLoadingDetails(true);
    try {
      const details = await appApi.customers.get(customer.id);
      setSelectedCustomer(details);
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!selectedCustomer) return;
    
    try {
      await appApi.customers.update(selectedCustomer.id, formData);
      setIsEditing(false);
      // Refresh details
      const details = await appApi.customers.get(selectedCustomer.id);
      setSelectedCustomer(details);
      onRefresh();
    } catch (error: any) {
      throw error;
    }
  };

  const handleExport = () => {
    const headers = ['ID', '名前', 'メール', '電話', '会員種別', 'ステータス'];
    const rows = filteredCustomers.map(c => [c.id, c.name, c.email, c.phone, c.membership_type, c.membership_status]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `customers_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!selectedCustomer ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CustomerList
              customers={filteredCustomers}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterType={filterType}
              onFilterChange={setFilterType}
              onSelect={handleSelectCustomer}
              onExport={handleExport}
            />
          </motion.div>
        ) : isEditing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CustomerEdit
              customer={selectedCustomer}
              onClose={() => {
                if (window.confirm('編集内容が破棄されます。よろしいですか？')) {
                  setIsEditing(false);
                  setSelectedCustomer(null);
                }
              }}
              onBack={() => {
                if (window.confirm('編集内容が破棄されます。よろしいですか？')) {
                  setIsEditing(false);
                }
              }}
              onSubmit={handleUpdate}
            />
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CustomerDetail
              customer={selectedCustomer}
              loading={loadingDetails}
              onClose={() => setSelectedCustomer(null)}
              onEdit={() => setIsEditing(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
