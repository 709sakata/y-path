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
    get: (period?: string): Promise<DashboardStats> => fetchWithAuth(period ? `/api/stats?period=${period}` : '/api/stats'),
  },
  organizations: {
    list: (): Promise<Organization[]> => fetchWithAuth('/api/organizations'),
    create: (data: any) => fetchWithAuth('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    delete: (id: string) => fetchWithAuth(`/api/organizations/${id}`, { method: 'DELETE' }),
  },
  surveys: {
    import: (data: any) => fetchWithAuth('/api/surveys/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    getByParent: (parentId: string) => fetchWithAuth(`/api/surveys/parent/${parentId}`),
    getAll: () => fetchWithAuth('/api/surveys'),
    link: (id: string, data: any) => fetchWithAuth(`/api/surveys/${id}/link`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  },
  users: {
    list: () => fetchWithAuth('/api/users'),
    updateRole: (id: string, role: string) => fetchWithAuth(`/api/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    }),
    delete: (id: string) => fetchWithAuth(`/api/users/${id}`, { method: 'DELETE' }),
  },
  import: {
    customers: (data: any) => fetchWithAuth('/api/import/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customers: data })
    }),
    reservations: (data: any) => fetchWithAuth('/api/import/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservations: data })
    }),
    programs: (data: any) => fetchWithAuth('/api/import/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programs: data })
    }),
    surveys: (data: any) => fetchWithAuth('/api/import/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ surveys: data })
    })
  }
};
