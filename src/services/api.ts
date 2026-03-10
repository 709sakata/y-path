import { 
  User, Parent, Program, Reservation, DashboardStats, Organization 
} from '../types';

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

const fetchWithAuth = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include',
  })
  .then(handleResponse)
  .catch(err => {
    console.error(`API Error [${url}]:`, err);
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認するか、しばらく待ってから再試行してください。');
    }
    throw err;
  });
};

export const api = {
  auth: {
    me: (): Promise<{ user: User | null; parent: Parent | null }> => fetchWithAuth('/api/auth/me'),
    logout: () => fetchWithAuth('/api/auth/logout', { method: 'POST' }),
  },
  programs: {
    list: (): Promise<Program[]> => fetchWithAuth('/api/programs'),
    create: (data: any) => fetchWithAuth('/api/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    update: (id: string, data: any) => fetchWithAuth(`/api/programs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    delete: (id: string) => fetchWithAuth(`/api/programs/${id}`, { method: 'DELETE' }),
  },
  customers: {
    list: (): Promise<Parent[]> => fetchWithAuth('/api/customers'),
    get: (id: string): Promise<Parent & { history: Reservation[] }> => 
      fetchWithAuth(`/api/customers/${id}`),
    create: (data: any) => fetchWithAuth('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    update: (id: string, data: any) => fetchWithAuth(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  },
  reservations: {
    list: (): Promise<Reservation[]> => fetchWithAuth('/api/reservations'),
    create: (data: any) => fetchWithAuth('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    updateStatus: (id: string, status: string) => fetchWithAuth(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }),
  },
  stats: {
    get: (): Promise<DashboardStats> => fetchWithAuth('/api/stats'),
  },
  organizations: {
    list: (): Promise<Organization[]> => fetchWithAuth('/api/organizations'),
  }
};
