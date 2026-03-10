import { useState, useEffect, useCallback } from 'react';
import { User, Parent } from '../types';
import { api } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [parentProfile, setParentProfile] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const data = await api.auth.me();
      if (data.user) {
        setUser(data.user);
        if (data.parent) setParentProfile(data.parent);
      } else {
        setUser(null);
        setParentProfile(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setParentProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((u: User, p: Parent | null) => {
    setUser(u);
    setParentProfile(p);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setParentProfile(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    parentProfile,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
    refreshAuth: checkAuth
  };
}
