import { useState, useCallback } from 'react';
import { DashboardStats, Parent, Reservation, Program, User } from '../types';
import { api } from '../services/api';
import { DUMMY_STATS, DUMMY_CUSTOMERS, DUMMY_RESERVATIONS, DUMMY_PROGRAMS } from '../constants/dummyData';

export function useAdminData(isAdmin: boolean, user: User | null, period: string = 'all') {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [customers, setCustomers] = useState<Parent[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAdmin || !user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [statsData, custData, resData, programsData] = await Promise.all([
        api.stats.get(period).catch(() => DUMMY_STATS),
        api.customers.list().catch(() => DUMMY_CUSTOMERS),
        api.reservations.list().catch(() => DUMMY_RESERVATIONS),
        api.programs.list().catch(() => DUMMY_PROGRAMS)
      ]);
      
      let filteredPrograms = programsData;
      let filteredReservations = resData;

      if (user.organization_id) {
        filteredPrograms = programsData.filter(p => p.organization_id === user.organization_id);
        const programIds = new Set(filteredPrograms.map(p => p.id));
        // Note: Reservations might need to be filtered by program_schedule_id mapping
        // For simplicity in this dummy data environment, we'll assume program_title match or similar
        // In a real app, the server would handle this.
        filteredReservations = resData.filter(r => {
          const program = programsData.find(p => p.title === r.program_title);
          return program && program.organization_id === user.organization_id;
        });
      }

      setStats(statsData);
      setCustomers(custData);
      setReservations(filteredReservations);
      setPrograms(filteredPrograms);
    } catch (err: any) {
      console.error('Fetch admin data failed:', err);
      setError(err.message || 'データの取得に失敗しました');
      
      // Fallback to dummy data only if all failed
      setStats(DUMMY_STATS);
      setCustomers(DUMMY_CUSTOMERS);
      setReservations(DUMMY_RESERVATIONS);
      setPrograms(DUMMY_PROGRAMS);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user, period]);

  return {
    stats,
    customers,
    reservations,
    programs,
    loading,
    error,
    refreshData: fetchData
  };
}
