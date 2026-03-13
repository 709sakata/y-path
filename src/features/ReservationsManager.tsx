import * as React from 'react';
import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Reservation } from '../types';
import { RESERVATION_STATUS, ACTUAL_ATTENDANCE_STATUS } from '../constants';
import { api as appApi } from '../services/api';
import { useReservationFilters } from '../hooks/useReservationFilters';
import { ReservationList } from './ReservationList';
import { ReservationDetail } from './ReservationDetail';

interface ReservationsManagerProps {
  reservations: Reservation[];
  onRefresh: () => void;
  onUnauthorized?: () => void;
}

export function ReservationsManager({ reservations, onRefresh, onUnauthorized }: ReservationsManagerProps) {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  
  const filterProps = useReservationFilters(reservations);
  const { filteredReservations } = filterProps;

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === RESERVATION_STATUS.PENDING).length,
    confirmed: reservations.filter(r => r.status === RESERVATION_STATUS.CONFIRMED).length
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await appApi.reservations.updateStatus(id, status);
      onRefresh();
      if (selectedReservation?.id === id) {
        setSelectedReservation(prev => prev ? { ...prev, status: status as any } : null);
      }
    } catch (error: any) {
      if (error.error === 'Unauthorized' && onUnauthorized) {
        onUnauthorized();
      } else {
        console.error('ステータスの更新に失敗しました');
      }
    }
  };

  const handleUpdateAttendance = async (attendanceId: string, status: string) => {
    try {
      // Simulate API call
      console.log(`出席状況を「${status === ACTUAL_ATTENDANCE_STATUS.ATTENDED ? '出席' : '欠席'}」に更新しました（デモ）`);
      onRefresh();
    } catch (error) {
      console.error('出席状況の更新に失敗しました');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', '申込者', '電話番号', 'プログラム', '日付', '時間', '金額', 'ステータス'];
    const rows = filteredReservations.map(r => [
      r.id,
      r.parent_name,
      r.parent_phone,
      r.program_title,
      r.date,
      r.time,
      r.total_price,
      r.status
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reservations_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!selectedReservation ? (
          <ReservationList
            {...filterProps}
            onSelect={setSelectedReservation}
            onUpdateStatus={handleUpdateStatus}
            onExport={exportToCSV}
            stats={stats}
          />
        ) : (
          <ReservationDetail
            reservation={selectedReservation}
            onClose={() => setSelectedReservation(null)}
            onUpdateStatus={handleUpdateStatus}
            onUpdateAttendance={handleUpdateAttendance}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
