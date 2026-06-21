const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const api = {
  auth: {
    register: (email: string, password: string, name?: string) =>
      request<{ token: string; user: { id: string; email: string; name?: string } }>(
        '/api/auth/register',
        { method: 'POST', body: JSON.stringify({ email, password, name }) }
      ),
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string; name?: string } }>(
        '/api/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
  },

  trips: {
    getAll: () => request<import('../types').Trip[]>('/api/trips'),
    getById: (id: string) => request<import('../types').Trip>(`/api/trips/${id}`),
    generate: (payload: import('../types').CreateTripPayload) =>
      request<import('../types').Trip>('/api/trips/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, data: Partial<import('../types').Trip>) =>
      request<import('../types').Trip>(`/api/trips/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/api/trips/${id}`, { method: 'DELETE' }),
    addActivity: (
      id: string,
      dayNumber: number,
      activity: { title: string; description?: string; estimatedCostUSD?: number; timeOfDay?: string }
    ) =>
      request<import('../types').Trip>(`/api/trips/${id}/activities`, {
        method: 'POST',
        body: JSON.stringify({ dayNumber, activity }),
      }),
    removeActivity: (id: string, dayNumber: number, activityIndex: number) =>
      request<import('../types').Trip>(`/api/trips/${id}/activities`, {
        method: 'DELETE',
        body: JSON.stringify({ dayNumber, activityIndex }),
      }),
    regenerateDay: (id: string, dayNumber: number, feedback?: string) =>
      request<import('../types').Trip>(`/api/trips/${id}/regenerate-day`, {
        method: 'POST',
        body: JSON.stringify({ dayNumber, feedback }),
      }),
    regeneratePackingList: (id: string) =>
      request<import('../types').Trip>(`/api/trips/${id}/regenerate-packing`, {
        method: 'POST',
      }),
  },
};
